import { LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions, Viewport } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import { Cluster } from 'puppeteer-cluster';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlocker from 'puppeteer-extra-plugin-adblocker';
import {
  QualwebOptions,
  Evaluations,
  PuppeteerPlugins,
  ClusterOptions,
  LoadEvent,
  QualwebPlugin,
  QualWebStartOptions
} from '@qualweb/core';
import { generateEARLReport } from '@qualweb/earl-reporter';
import { Dom } from '@qualweb/dom';
import { Evaluation } from '@qualweb/evaluation';
import { Crawler, CrawlOptions } from '@qualweb/crawler';
import locales, { Lang, Locale, TranslationObject } from '@qualweb/locale';
import { readFile, writeFile, unlink } from 'fs';
import path from 'path';
import 'colors';
import { CMPManager, DescriptorConsentData, ParsePageOptions, SimpleCMPDescriptor } from '@inqludeit/cmp-b-gone';

/**
 * QualWeb engine - Performs web accessibility evaluations using several modules:
 * - act-rules module (https://github.com/qualweb/act-rules)
 * - wcag-techniques module (https://github.com/qualweb/wcag-techniques)
 * - best-practices module (https://github.com/qualweb/best-practices)
 */
class QualWeb {
  /**
   * Chromium browser cluster.
   */
  private cluster?: Cluster;

  /**
   * Array of plugins added with QualWeb.use().
   */
  private qualwebPlugins: QualwebPlugin[] = [];

  private cmpManager?: CMPManager;

  /**
   * Prefix used for temporary descriptors added in calls to {@link evaluate()}.
   */
  private readonly cmpTmpDescriptorPrefix: string = '__TMP_DESCRIPTOR_';

  /**
   * A cache of descriptors that ties a domain (the key) to whichever CMP was
   * detected the last time that domain was visisted. This is necessary because
   * subsequent visits to the same domain probably won't show the CMP banner,
   * due to the presence of previously stored cookies. This cache helps
   * recognize those cases.
   */
  private descriptorCache: Record<string, DescriptorConsentData> = {};

  /**
   * Initializes puppeteer with given plugins.
   *
   * @param {PuppeteerPlugins} plugins - Plugins for puppeteer - supported: AdBlocker and Stealth.
   */
  constructor(plugins?: PuppeteerPlugins) {
    if (plugins?.stealth) {
      puppeteer.use(StealthPlugin());
    }
    if (plugins?.adBlock) {
      puppeteer.use(AdBlocker({ blockTrackers: true }));
    }
  }

  /**
   * Starts chromium browser cluster.
   *
   * @param {ClusterOptions} clusterOptions - Options for cluster initialization.
   * @param {LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions} puppeteerOptions - check https://github.com/puppeteer/puppeteer/blob/v9.1.1/docs/api.md#puppeteerlaunchoptions.
   */
  public async start(
    clusterOptions?: ClusterOptions,
    puppeteerOptions?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions,
    additionalOptions?: QualWebStartOptions
  ): Promise<void> {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: clusterOptions?.maxConcurrency ?? 1,
      puppeteerOptions: puppeteerOptions,
      puppeteer: puppeteer,
      timeout: clusterOptions?.timeout ?? 60 * 1000,
      monitor: clusterOptions?.monitor ?? false
    });

    if (additionalOptions?.cmpManager === true) {
      // Set up a CMPManager with all built-ins.
      this.cmpManager = await CMPManager.createManager(undefined, true);
    } else if (additionalOptions?.cmpManager) {
      // Use the provided CMPManager.
      this.cmpManager = additionalOptions.cmpManager;
    }

    // If we're using CMP suppression, initialize/reset the internal descriptor
    // cache. Generally speaking, the cache should be cleared every time the
    // Chrome instance starts with an empty cache, to fit.
    // The goal is to be able to ask the question "in this session, have we
    // previously encountered and successfully suppressed a CMP on this domain?"
    if (this.cmpManager) {
      this.descriptorCache = {};
    }
  }

  /**
   * Adds a plugin to be run when executing a QualWeb evaluation. Plugins are
   * called in the same order they were added to the instance.
   * @param plugin The plugin to add.
   * @returns The QualWeb instance itself. Good for chaining.
   */
  public use(plugin: QualwebPlugin): this {
    this.qualwebPlugins.push(plugin);

    return this;
  }

  /**
   * Closes chromium browser.
   */
  public async stop(): Promise<void> {
    await this.cluster?.close();
  }

  /**
   * Evaluates given options.
   *
   * @param {QualwebOptions} options - Options of execution (check https://github.com/qualweb/core#options).
   * @returns List of evaluations.
   */
  public async evaluate(options: QualwebOptions): Promise<Evaluations> {
    const modulesToExecute = {
      act: true,
      wcag: true,
      bp: true,
      wappalyzer: false,
      counter: false
    };

    const urls = await this.checkUrls(options);

    if ((options.html === undefined || options.html.trim() === '') && urls.length === 0) {
      throw new Error('Invalid input method');
    }

    this.handleLocales(options);

    if (options.execute) {
      modulesToExecute.act = !!options.execute.act;
      modulesToExecute.wcag = !!options.execute.wcag;
      modulesToExecute.bp = !!options.execute.bp;
      modulesToExecute.wappalyzer = !!options.execute.wappalyzer;
      modulesToExecute.counter = !!options.execute.counter;
    }

    // Depending on whether we initialized a cmpManager during start()
    // (indicating that we want to use built-ins as well) or not, we either
    // create an ad hoc instance or use the one already in this QualWeb object.

    // Array of descriptor names. We use this to keep track of the temporary
    // descriptors we may have created (passed via options), so they can be
    // removed again after evaluation.
    const tmpDescriptorNames: string[] = [];

    // Local reference to whichever CMPManager should be used during evaluation.
    // This will either be the QualWeb object's version (which persists between
    // evaluate() calls), a temporary version for this call of evaluate(), or
    // null (in case of no CMP dismissal).

    let cmpManager: CMPManager | null = null;

    if (this.cmpManager || options.cmpDescriptors) {
      if (this.cmpManager) {
        // Re-use CMPManager set during start().
        cmpManager = this.cmpManager;

        // if (cmpManager.descriptorNames.length === 0) {
        //   console.warn('CMPManager has no descriptors for evaluation. Was this intentional?');
        // }
      } else {
        // Create empty CMPManager for this evaluation only.
        cmpManager = await CMPManager.createManager(undefined, false);
      }

      // If the caller added temporary descriptors via options, add them to the
      // CMPManager instance. We give them some names that are unlikely to
      // clash with others already present, and so they can be removed after
      // evaluation has run.
      if (options.cmpDescriptors) {
        let descriptorNameCounter = 0;

        for (const tmpDescriptor of options.cmpDescriptors) {
          const tmpDescriptorName = `${this.cmpTmpDescriptorPrefix}${descriptorNameCounter++}`;

          cmpManager.addDescriptors([
            new SimpleCMPDescriptor(
              tmpDescriptorName,
              tmpDescriptor.storageOptions,
              tmpDescriptor.presenceSelectors,
              tmpDescriptor.acceptAllSelectors
            )
          ]);

          tmpDescriptorNames.push(tmpDescriptorName);
        }
      }
    }

    const evaluations: Evaluations = {};

    let foundError = false;

    const timestamp = new Date().getTime();

    handleError(
      options,
      'Evaluation errors',
      new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '') + '\n-----------',
      timestamp
    );

    this.cluster?.on('taskerror', (err, data) => {
      foundError = true;
      handleError(options, data.url, err.message + '\n-----------', timestamp);
    });

    await this.cluster?.task(async ({ page, data: { url, html } }) => {
      const dom = new Dom(page, options.validator);

      // Execute beforePageLoad on all plugins in order. If any exceptions
      // occur during the execution of a plugin, it should bubble up past the
      // call to Qualweb.evaluate() so the user can handle it on their own.
      for (const plugin of this.qualwebPlugins) {
        if (typeof plugin.beforePageLoad === 'function') {
          await plugin.beforePageLoad(page, url || 'customHtml');
        }
      }

      const { sourceHtml, validation } = await dom.process(options, url ?? '', html ?? '');
      const evaluation = new Evaluation(url, page, modulesToExecute);

      // Run built-in CMP dismissal before any other plugin. We only run this
      // if the CMPManager has been set *and* actually defines some descriptors.
      // We should really have a good way to warn the user if there are no
      // descriptors, but a defined manager. Useful diagnostic info.

      // Tracks if we successfully suppressed a CMP. The value is used on the
      // other side of the evaluation, so the variable must be declared here.
      let cmpData: DescriptorConsentData | null = null;

      if (cmpManager !== null && cmpManager.descriptorNames.length > 0) {
        const urlHost = new URL(url).host;

        const previousDescriptor = this.descriptorCache[urlHost];

        const parsePageOpts: ParsePageOptions = {};

        if (previousDescriptor) {
          // console.debug(`Re-using descriptor ${previousDescriptor.descriptor} for host ${urlhost}`);

          parsePageOpts.descriptor = previousDescriptor.descriptor;
        }

        cmpData = await cmpManager.parsePage(page, parsePageOpts);

        if (cmpData === null) {
          if (previousDescriptor) {
            // No CMP was detected. Check for presence of consent cookies. If
            // they are present, we'll assume that the CMP was suppressed using
            // those.
            const descriptorInstance = cmpManager.getDescriptor(previousDescriptor.descriptor);

            if (!descriptorInstance) {
              throw new Error(`CMP descriptor "${previousDescriptor.descriptor}" is not present in CMPManager!`);
            }

            const consentData = await descriptorInstance?.getConsentData(page);

            if (consentData.length === 0) {
              throw new Error(`No CMP was detected on page and cache has no consent data.`);
            } else {
              // console.debug(`Previous descriptor for ${urlhost} was used and no CMP was detected. ASSUME successful suppression.`);
            }
          } else {
            throw new Error('No CMP was detected!');
          }
        } else if (!previousDescriptor) {
          if (cmpData.descriptor.startsWith(this.cmpTmpDescriptorPrefix) === false) {
            // console.debug(`Saving descriptor ${cmpData.descriptor} for future visits to ${urlHost}`);
  
            // Store the detected descriptor for later visits.
            this.descriptorCache[urlHost] = cmpData;
          } else {
            // console.debug(`Skipping caching for temporary descriptor  ${cmpData.descriptor} on URL ${urlHost}`);
          }
        }
      }

      // Execute afterPageLoad on all plugins in order. Same assumptions for
      // exceptions apply as they did for beforePageLoad.
      for (const plugin of this.qualwebPlugins) {
        if (typeof plugin.afterPageLoad === 'function') {
          await plugin.afterPageLoad(page, url || 'customHtml');
        }
      }

      const evaluationReport = await evaluation.evaluatePage(sourceHtml, options, validation);

      // Try to remove cookies if a temporary descriptor was used.
      if (cmpData?.descriptor.startsWith(this.cmpTmpDescriptorPrefix)) {
        if (cmpData.cookies) {
          // console.debug(`Removing cookie data for temporary descriptor ${cmpData.descriptor}`);
  
          page.deleteCookie(...cmpData.cookies);
        } else if (cmpData.localStorage) {
          // localStorage is not supported!
        }
      }

      evaluations[url || 'customHtml'] = evaluationReport.getFinalReport();
    });

    for (const url of urls) {
      this.cluster?.queue({ url });
    }

    if (options.html) {
      this.cluster?.queue({ html: options.html });
    }

    await this.cluster?.idle();

    // Once evaluation has finished, remove any temporary descriptors from the
    // CMPManager instance.

    if (cmpManager !== null && tmpDescriptorNames.length > 0) {
      for (const tmpDescriptorName of tmpDescriptorNames) {
        
        // Remove descriptor cookies from puppeteer cache.
        // Remove descriptor from CMPManager
        cmpManager.removeDescriptor(tmpDescriptorName);
        // Purge the descriptor cache of temporary descriptors.
        delete this.descriptorCache[tmpDescriptorName];
      }
    }

    if (options.log?.file) {
      if (foundError) {
        console.warn('One or more urls failed to evaluate. Check the error.log for more information.'.yellow);
      } else {
        deleteErrorLogFile(timestamp);
      }
    }

    return evaluations;
  }

  /**
   * Crawls a webpage to find all urls.
   *
   * @param {string} startingUrl - Webpage to crawl.
   * @param {CrawlOptions} options - Options for crawling process.
   * @Param {Viewport} viewport - Set the viewport of the webpages.
   * @param {LoadEvent | Array<LoadEvent>} waitUntil - Wait for dom events before starting the crawling process.
   * @returns List of decoded urls.
   */
  public async crawl(
    domain: string,
    options?: CrawlOptions,
    viewport?: Viewport,
    waitUntil?: LoadEvent | Array<LoadEvent>
  ): Promise<Array<string>> {
    const browser = await puppeteer.launch();
    const incognito = await browser.createIncognitoBrowserContext();
    const crawler = new Crawler(incognito, domain, viewport, waitUntil);
    await crawler.crawl(options);
    return crawler.getResults();
  }

  /**
   * Checks possible input options and compiles the urls.
   * Possible input options are:
   * - url - single url;
   * - urls - multiple urls;
   * - filepath - path to file with urls;
   * - crawler - domain to crawl and gather urls.
   *
   * @param {QualwebOptions} options - QualWeb options.
   * @returns List of urls.
   */
  private async checkUrls(options: QualwebOptions): Promise<Array<string>> {
    const urls = new Array<string>();
    if (options.url) {
      urls.push(decodeURIComponent(options.url).trim());
    }
    if (options.urls) {
      urls.push(...options.urls.map((url: string) => decodeURIComponent(url).trim()));
    }
    if (options.file) {
      urls.push(...(await getFileUrls(options.file)));
    }
    if (options.crawl) {
      const viewport = {
        width: 0,
        height: 0,
        isMobile: false,
        isLandscape: true
      };
      if (options.viewport) {
        viewport.width = options?.viewport?.resolution?.width ?? 0;
        viewport.height = options?.viewport?.resolution?.height ?? 0;
        viewport.isMobile = options?.viewport?.mobile ?? false;
        viewport.isLandscape = options?.viewport?.landscape ?? true;
      }
      urls.push(
        ...(await this.crawl(
          options.crawl,
          options.crawlOptions,
          viewport.width + viewport.height !== 0 ? viewport : undefined,
          options.waitUntil
        ))
      );
    }

    return urls;
  }

  private handleLocales(options: QualwebOptions): void {
    if (options.translate) {
      if (typeof options.translate === 'string') {
        if (Object.keys(locales).includes(options.translate)) {
          options.translate = {
            translate: locales[<Lang>options.translate],
            fallback: locales.en
          };
        } else {
          throw new Error(`Locale "${options.translate}" not supported.`);
        }
      } else if (Object.keys(options.translate).includes('translate')) {
        this.verifyTranslationObject(options);
      } else {
        options.translate = {
          translate: <Locale>options.translate,
          fallback: locales.en
        };
      }
    } else {
      options.translate = {
        translate: locales.en,
        fallback: locales.en
      };
    }
  }

  private verifyTranslationObject(options: QualwebOptions): void {
    if (typeof (<TranslationObject>options.translate).translate === 'string') {
      if (Object.keys(locales).includes(<string>(<TranslationObject>options.translate).translate)) {
        options.translate = {
          translate: locales[<Lang>(<TranslationObject>options.translate).translate],
          fallback: locales.en
        };
      } else {
        throw new Error(`Locale "${(<TranslationObject>options.translate).translate}" not supported.`);
      }
    }
    if (typeof (<TranslationObject>options.translate).fallback === 'string') {
      if (Object.keys(locales).includes(<string>(<TranslationObject>options.translate).fallback)) {
        (<TranslationObject>options.translate).fallback =
          locales[<Lang>(<TranslationObject>options.translate).fallback];
      } else {
        throw new Error(`Locale "${(<TranslationObject>options.translate).fallback}" not supported.`);
      }
    }
  }
}

/**
 * Reads a file to obtain the urls to evaluate.
 *
 * @param {string} file - Path to file of urls.
 * @returns List of decoded urls.
 */
async function getFileUrls(file: string): Promise<Array<string>> {
  const content = await readFileData(file);
  return content
    .split('\n')
    .map((url: string) => {
      try {
        return decodeURIComponent(url).trim();
      } catch (_err) {
        return '';
      }
    })
    .filter((url: string) => url.trim() !== '');
}

/**
 * Reads a file.
 *
 * @param {string} file - Path to file.
 * @returns File data converted to UTF-8.
 */
function readFileData(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString('utf-8'));
      }
    });
  });
}

/**
 * Logs evaluation errors to a error log file.
 *
 * @param {options} QualwebOptions - options to check logging method
 * @param {string} url - Url that failed to evaluate.
 * @param {string} message - Error message of the evaluation.
 * @param {number} timestamp - Date of the evaluation.
 */
function handleError(options: QualwebOptions, url: string, message: string, timestamp: number): void {
  if (options.log && options.log.file) {
    writeFile(
      path.resolve(process.cwd(), `qualweb-errors-${timestamp}.log`),
      url + ' : ' + message + '\n',
      { flag: 'a', encoding: 'utf-8' },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
  if (options.log && options.log.console) {
    console.error(url + ' : ' + message + '\n');
  }
}

/**
 * Deletes the error log file created at the beginning of the evaluation if there aren't any errors to report.
 *
 * @param {number} timestamp - Date of the evaluation.
 */
function deleteErrorLogFile(timestamp: number): void {
  unlink(path.resolve(process.cwd(), `qualweb-errors-${timestamp}.log`), (err) => {
    if (err) {
      throw err;
    }
  });
}

export { QualWeb, generateEARLReport, getFileUrls };
