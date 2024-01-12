import { Crawler } from '../dist/index.js';
import puppeteer from 'puppeteer';
import { expect } from 'chai';

import { createServer } from '@mocks-server/main';

describe('@qualweb/crawler', () => {
  let browser;
  let mockServer;

  before(async () => {
    browser = await puppeteer.launch({
      headless: false,
    });

    mockServer = createServer({
      config: {
        readArguments: true,
        readEnvironment: true,
        readFile: true,
      },
      // plugins: {
      //   inquirerCli: {
      //     enabled: true,
      //   },
      // },
      files: {
        enabled: true,
      },
      // mock: {
      //   collections: {
      //     selected: 'link-chain',
      //   },
      // },
    });

    mockServer.start();
  });

  // it('Should do fuck all', () => {
  //   const t = 2 + 2;
  //   expect(t).to.equal(4);
  // });

  it('Should navigate to a mocked HTML page', async () => {
    const page = await browser.newPage();

    await page.goto('http://localhost:3100');


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

//   it('maxDepth: 0', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, maxDepth: 0 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
//   });

//   it('maxDepth: 1', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, maxDepth: 1 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
//   });

//   it('maxUrls: 10', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, maxUrls: 10 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
//   });

//   it('MaxUrls: 100', async function () {
//     this.timeout(0);
//     const crawler = new Crawler(browser, 'https://ciencias.ulisboa.pt');
//     await crawler.crawl({ logging: true, maxUrls: 100 });
//     const urls = crawler.getResults();
//     console.log(urls.length);
//     expect(urls.length).to.be.greaterThan(1);
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
