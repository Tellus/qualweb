import { expect } from 'chai';

import { Crawler } from '../dist/index.js';
import { usePuppeteer, useMockServer } from './util.mjs';

describe('Limit tests', () => {
  const mockServerProxy = useMockServer('infinite-links');
  const proxy = usePuppeteer();

  it('Should follow a chain of links until there are no more (maxUrls: default value / undefined)', async function () {
    this.timeout(5000);

    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl();

    const results = c.getResults();

    expect(results).to.have.length(12);
    expect(results[0]).to.equal(`${startingUrl}/`);
    
    for (let i = 1; i < 12; i++) {
      expect(results[i]).to.equal(`${startingUrl}/loop/10/${i - 1}`);
    }
  });

  it('Should follow a chain of links until there are no more (maxUrls: -1)', async () => {
    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl({
      maxUrls: -1,
    });

    const results = c.getResults();

    const expectedLinkCount = 12;

    expect(results).to.have.length(expectedLinkCount);
    expect(results[0]).to.equal(`${startingUrl}/`);
    
    for (let i = 1; i < expectedLinkCount; i++) {
      expect(results[i]).to.equal(`${startingUrl}/loop/10/${i - 1}`);
    }
  });

  it('Should immediately return instead of crawling (maxUrls: 1)', async () => {
    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl({
      maxUrls: 1,
    });

    const results = c.getResults();

    expect(results).to.have.length(1);
    expect(results[0]).to.equal(`${startingUrl}/`);
  });
  
  // TODO: consider adding versions for larger amounts of URLs. Not sure what max we expect the crawler to be able to handle.
  it('Should follow a chain of links up to a max count (maxUrls: 5)', async () => {
    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl({
      maxUrls: 5,
    });

    const results = c.getResults();

    const expectedLinkCount = 5;

    expect(results).to.have.length(expectedLinkCount);
    expect(results[0]).to.equal(`${startingUrl}/`);
    
    for (let i = 1; i < expectedLinkCount; i++) {
      expect(results[i]).to.equal(`${startingUrl}/loop/10/${i - 1}`);
    }
  });
});