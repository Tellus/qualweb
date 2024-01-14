import puppeteer from 'puppeteer';
import { createServer } from '@mocks-server/main';

/**
 * Sets up a proxy object that will be populated with browser object, incognito
 * context, and page object before a unit test runs.
 * @returns A proxy object that will be populated with a usable browser,
 * incognito context, and page object when a unit test runs.
 */
export function usePuppeteer(launchOptions) {
  const proxy = {
    browser: undefined,
    incognito: undefined,
    page: undefined,
  };

  beforeEach(async () => {
    proxy.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--ignore-certificate-errors'],
      ...launchOptions,
    });

    proxy.incognito = await proxy.browser.createIncognitoBrowserContext();

    proxy.page = await proxy.incognito.newPage();
  })

  afterEach(async () => {
    await proxy.page?.close();
    await proxy.incognito?.close();
    await proxy.browser?.close();
  });

  return proxy;
}

/**
 * 
 * @param {string} collection The route collection to use in the server. Can be
 * modified after startup by calling mockServer.mock.collections.select() on the
 * returned proxy.
 * @returns A faux proxy object, with fields that are set and deleted before and
 * after all tests within the suite where {@link useMockServer} was used.
 */
export function useMockServer({ collection, skipTeardown }) {

  let mockServerProxyObject = {
    mockServer: null,
  };

  before(async () => {
    mockServerProxyObject.mockServer = createServer({
      config: {
        readArguments: true,
        readEnvironment: true,
        readFile: true,
      },
      log: 'silent',
      files: {
        enabled: true,
      },
      mock: {
        collections: {
          selected: collection,
        },
      },
    });

    await mockServerProxyObject.mockServer.start();
  });

  if (skipTeardown !== true) {
    after(async () => {
      await mockServerProxyObject.mockServer.stop();
    });
  }

  return mockServerProxyObject;
}