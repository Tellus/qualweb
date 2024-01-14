import { expect } from 'chai';

import { Crawler } from '../dist/index.js';
import { usePuppeteer, useMockServer } from './util.mjs';

describe('Depth tests', () => {
  const mockServerProxy = useMockServer('depth');
  const proxy = usePuppeteer();

  it('Should follow a branching tree of links until there are no more', async function () {
    this.timeout(5000);

    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl();

    const results = c.getResults();

    const expectedLinkCount = 32;

    expect(results).to.have.length(expectedLinkCount);

    expect(results[0]).to.equal(`${startingUrl}/`);
    
    // for (let i = 1; i < expectedLinkCount; i++) {
    //   expect(results[i]).to.equal(`${startingUrl}/tree/10/3/${i - 1}`);
    // }
  });
})