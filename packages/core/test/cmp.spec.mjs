import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { expect } from 'chai';
import { CMPManager } from '@inqludeit/cmp-b-gone';

import { QualWeb } from '../dist/index.js';

import express from 'express';

export async function setupStaticServer(path) {
  return new Promise((resolve, reject) => {
    try {
      const app = new express();

      app.use(express.static(path));

      app.listen(process.env.EXPRESS_PORT, function () {
        resolve(this);
      });
    } catch (err) {
      reject(err);
    }
  });
}

const __dirname = fileURLToPath(new URL('.', import.meta.url));

describe('CMP suppression', function () {
  this.timeout(10000);

  // QualWeb instance. Kept out of test cases so teardown can guarantee cleanup.
  let qw = null;

  let staticServer;
  let staticServerHost;

  // Set up a static file server for serving an HTML file with cookies. This
  // has to be done, because most browsers will not work with cookies on HTML
  // files that are clearly served from local disk.
  before(async () => {
    staticServer = await setupStaticServer(path.resolve(__dirname, 'fixtures/cmp'));

    staticServerHost = `http://localhost:${staticServer.address().port}`;
  });

  // Close the static file server after tests have run.
  after(() => {
    staticServer.close();
  })

  // Set up a fresh QualWeb instance before each test. This is kept outside of
  // the test case itself so we can run a separate teardown, even in cases where
  // the tests crash.
  beforeEach(async () => {
    if (qw !== null) {
      throw new Error(`qw variable has already been defined. Did a previous test case fail to clean up?`);
    }

    qw = new QualWeb();
  });

  afterEach(async () => {
    if (qw === null) {
      throw new Error(`qw cannot be cleaned up, it is null!`);
    }

    await qw.stop();

    qw = null;
  });

  // This test is a bit fragile. It depends on the cookie banner in
  // cookiesite.html matching with the "brainsum/cookieconsent" descriptor in
  // cmp-b-gone.
  it('Should correctly detect a CMP defined in the built-in collection', async () => {
    const url = `${staticServerHost}/cookiesite.html`;

    await qw.start(undefined, { headless: 'new' }, {
      cmpManager: true,
    });

    const reports = await qw.evaluate({
      url,
      execute: {
        act: false,
        bp: false,
        counter: false,
        wappalyzer: false,
        wcag: false,
      },
      log: {
        file: false,
        console: false,
      },
    });

    // Ensure report was generated for the URL. This means that the CMP was
    // correctly suppressed.
    expect(reports).to.have.property(url);
  });

  it('Should evaluate a page with a CMP if no descriptors are set (trivial pass)', async () => {
    const url = `${staticServerHost}/cookiesite.html`;

    await qw.start(undefined, { headless: 'new' }, {
      cmpManager: await CMPManager.createManager(undefined, false),
    });

    const reports = await qw.evaluate({
      url,
      execute: {
        act: false,
        bp: false,
        counter: false,
        wappalyzer: false,
        wcag: false,
      },
      log: {
        file: false,
        console: false,
      },
    });

    // Ensure report was generated for the URL. This means that the CMP was
    // correctly suppressed.
    expect(reports).to.have.property(url);
  });

  it('Should correctly evaluate a page with a CMP if a descriptor is passed to evaluate()', async () => {
    const url = `${staticServerHost}/cookiesite.html`;

    await qw.start(undefined, { headless: 'new' }, {
      cmpManager: await CMPManager.createManager(undefined, false),
    });

    const reports = await qw.evaluate({
      url,
      execute: {
        act: false,
        bp: false,
        counter: false,
        wappalyzer: false,
        wcag: false,
      },
      log: {
        file: false,
        console: false,
      },
      cmpDescriptors: [
        {
          storageOptions: {
            cookies: ['cconsent', 'consentIDandDate']
          },
          presenceSelectors: ['div#cconsent-modal'],
          acceptAllSelectors: ['button.consent-give']
        }
      ],
    });

    // Ensure report was NOT generated for the URL. This means that evaluation
    // failed. We're assuming it was because the CMP was not detected.
    expect(reports).to.have.property(url);
  });

  it('Should fail to evaluate a page with a CMP if no descriptors matched (1 descriptor)', async () => {
    const url = `${staticServerHost}/cookiesite.html`;

    await qw.start(undefined, { headless: 'new' }, {
      cmpManager: await CMPManager.createManager(undefined, false),
    });

    const reports = await qw.evaluate({
      url,
      execute: {
        act: false,
        bp: false,
        counter: false,
        wappalyzer: false,
        wcag: false,
      },
      log: {
        file: true,
        console: true,
      },
      cmpDescriptors: [
        {
          storageOptions: {
            cookies: ['cconsent', 'consentIDandDate']
          },
          presenceSelectors: ['div#bad-selector'],
          acceptAllSelectors: ['button.bad-selector']
        }
      ],
    });

    console.debug(Object.keys(reports));

    // Ensure report was NOT generated for the URL. This means that evaluation
    // failed. We're assuming it was because the CMP was not detected.
    expect(reports).to.not.have.property(url);
  });

  it('Should evaluate two pages from the same domain without issue (caching test)', async () => {
    const url = `${staticServerHost}/cookiesite.html`;
    const url2 = `${staticServerHost}/cookiesite-2.html`;

    await qw.start(undefined, { headless: 'new' }, {
      cmpManager: await CMPManager.createManager(undefined, false),
    });

    const reports = await qw.evaluate({
      urls: [url, url2],
      execute: {
        act: false,
        bp: false,
        counter: false,
        wappalyzer: false,
        wcag: false,
      },
      log: {
        file: false,
        console: true,
      },
      cmpDescriptors: [
        {
          storageOptions: {
            cookies: ['cconsent', 'consentIDandDate']
          },
          presenceSelectors: ['div#cconsent-modal'],
          acceptAllSelectors: ['button.consent-give']
        }
      ],
    });

    // Ensure report was generated for the URL.
    expect(reports).to.have.property(url);
    expect(reports).to.have.property(url2);
  });
});
