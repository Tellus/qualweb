import { expect } from 'chai';
import { createServer } from '@mocks-server/main';

import { Crawler } from '../dist/index.js';
import { usePuppeteer, useMockServer, createKoaServer } from './util.mjs';

describe('General tests', () => {
  let mockHttpApplication;
  let mockHttpServer;
  let mockHttpServerHost;

  before(async () => {
    mockHttpApplication = createKoaServer();

    mockHttpServer = mockHttpApplication.listen();

    mockHttpServerHost = `http://localhost:${mockHttpServer.address().port}`;
  });

  const proxy = usePuppeteer();

  it('Should refuse to start a crawl from a link that is not at the root of the domain', async () => {
    // const startingUrl = `${mockServerProxy.mockServer.server.url}/loop/10/7/`;
    const startingUrl = `${mockHttpServerHost}/10/7/`;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl();

    const results = c.getResults();

    console.debug(results);

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
