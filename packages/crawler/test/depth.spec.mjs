import { expect } from 'chai';

import { Crawler } from '../dist/index.js';
import { usePuppeteer, useMockServer } from './util.mjs';

describe('Depth tests', () => {
  const mockServerProxy = useMockServer({
    collection: 'depth',
    skipTeardown: false,
  });
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

  const maxDepth = 3;
  const leafCount = 3;
  it(`Should follow a branching tree of links until a certain depth (maxDepth: ${maxDepth})`, async function () {
    this.timeout(5000);

    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl({
      maxDepth,
    });

    const results = c.getResults();

    // console.debug(results.length, results);

    // Expected result size is 1 + ((maxDepth * leafCount) - 2)
    // initialPage + (maxDepth * leafCount) - skippedChildrenInRoot
    const expectedLinkCount = 1 + ((maxDepth + 1) * leafCount) - 2;

    expect(results).to.have.length(expectedLinkCount);

    expect(results[0]).to.equal(`${startingUrl}/`);
    
    // for (let i = 1; i < expectedLinkCount; i++) {
    //   expect(results[i]).to.equal(`${startingUrl}/tree/10/3/${i - 1}`);
    // }
  });
})

function makeMaxDepthTest(maxDepth) {
  it(`Should follow a branching tree of links until a certain depth (maxDepth: ${maxDepth})`, async function () {
    this.timeout(5000);

    const startingUrl = mockServerProxy.mockServer.server.url;

    const c = new Crawler(proxy.browser, startingUrl);

    await c.crawl({
      maxDepth,
    });

    const results = c.getResults();

    console.debug(results.length, results);

    const expectedLinkCount = 11;

    expect(results).to.have.length(expectedLinkCount);

    expect(results[0]).to.equal(`${startingUrl}/`);
    
    // for (let i = 1; i < expectedLinkCount; i++) {
    //   expect(results[i]).to.equal(`${startingUrl}/tree/10/3/${i - 1}`);
    // }
  });
}