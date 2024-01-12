import { expect } from 'chai';
import { createServer } from '@mocks-server/main';

import { Crawler } from '../dist/index.js';
import { usePuppeteer, useMockServer } from './util.mjs';

describe('General tests', () => {
  let mockServerCore;

  before(async () => {
    mockServerCore = createServer({
      log: 'silent',
    });

    await mockServerCore.init();

    const { loadRoutes, loadCollections } = mockServerCore.mock.createLoaders();

    await loadRoutes([
      {
        id: 'base-link',
        url: '/',
        method: ['GET'],
        variants: [
          {
            id: 'base',
            type: 'text',
            options: {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
              body: '<html><head></head><body><a href="/loop/10/0">Initial link!</a></body></html>',
            },
          },
        ],
      },
      {
        id: 'deep-link',
        url: '/loop/10/7/',
        method: ['GET'],
        variants: [
          {
            id: 'base',
            type: 'text',
            options: {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
              },
              body: '<html><head></head><body><a href="/loop/10/0">Initial link!</a></body></html>',
            },
          },
        ],
      },
    ]);

    await loadCollections([
      {
        "id": "infinite-links",
        "routes": [
          "deep-link:base",
        ]
      },
    ]);

    await mockServerCore.start();
  });

  after(async () => {
    await mockServerCore.stop();
  })

  const proxy = usePuppeteer();
  // const mockServerProxy = useMockServer('infinite-links');

  it('Should refuse to start a crawl from a link that is not at the root of the domain', async () => {
    // const startingUrl = `${mockServerProxy.mockServer.server.url}/loop/10/7/`;
    const startingUrl = `${mockServerCore.server.url}/loop/10/7/`;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl();

    const results = c.getResults();

    expect(results).to.have.length(1);

    expect(results[0]).to.equal(startingUrl);
  });
});

// describe('Testing crawler execution', function () {
//   let browser;

//   before(async function () {
//     browser = await puppeteer.launch();
//   });

//   after(async function () {
//     await browser.close();
//   });

//   it('Timeout: 20 seconds', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, timeout: 20 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
//   });

//   it('Timeout: 1 minute', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, timeout: 60 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
//   });
// });
