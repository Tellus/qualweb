# Crawler testing

This document is a showdown between mocks-server and hand-writing a small Koa app.

- mocks-server is a single dependency, koa is at least two.
- mocks-server was primarily designed around testing API frontends, mocking an API. Our use case is much less statically defined (we have a small number of well-defined page/path structures that we want to be able to expand infinitely), so a list of routes/collections in mocks-server might be less maintainable than hand-writing dynamic routing in Koa.
- while mocks-server has an API that allows you to change routes/collections on the fly, you have to contend with the expected structure of routes/collections, which are far more complex than a piece of Koa middleware (not hugely complex, but certainly *more* complex).
  - on the flip side, modifying routes in a Koa app after startup is not possible. You have to create a new one every time you want to replace the active router. You could probably hack around it but we want as few sources of problems as possible with the test helpers.

## Testing cases

All of the tests should be scalable with a few simple variables. When testing depth parameters, we should be able to simply build a koa application with routing that will support X levels of pages with Y pages in each level (or more).

### General

A predetermined site map of interconnected pages is crawled in its entirety. This tests that the crawler's ability to branch out throughout a site and not returnd uplicaets of any encountered URL.

### Depth test

Tests to make sure that the crawler doesn't go past a specific "depth" of URLs (I'm not sure how the QW crawler determines depth - whether it's path depth or link depth). **It looks like it's link depth.**

This can (should?) be tested with both an infinitely branching tree of pages or just a long chain of single pages.

### Count test

Tests that the crawler can stop crawling after hitting a specific number of URLs (as opposed to depth of URLs). Essentially, the first X URLs detected ar returned. I don't know if the crawler is built to do breadth-first crawling or just FIFO-style. Not sure it matters to this specific test, either (URL order, maybe?)

### Order test

Tests that have the crawler work through a well-defined tree of pages, and ensures that the ordering is the same every time (or an expected order). I don't know if this is relevant for the QW crawler, but might be important to assert the indempotence of returned results when you aren't crawling full sites (depth/count limit).

### Stress test (?)

Ensures that the crawler can hit a guaranteed limit of pages (1000?) without crashing on default settings.

## Koa application design

The QW crawler refuses to start a crawl from anywhere but the root of a domain, so a basic notion of just placing different types of pathing on different literal paths is not an option. Everything has to start from the root, and so we have to reset the Koa application between test types. Splitting the tests into fitting suites (using the `describe()` function) might help us reduce the resetting to once per suite.

I think we might reasonably boil down the virtual sitemap to a single structure, that should work for all test cases.

All pages should be based on the same HTML doc, with the following:

- A link back to the root of the webserver ('/')
- A link back to the parent page
- A variable number of links to child pages. URLs to these should be a path-level deeper than the current page (i.e. an extra "sub-directory")

Since we're purpose-building a single router for the koa application, we can omit a lot of path-based variables that were necessary in the mocks-server variations (no more "/tree/:maxDepth/:currentDepth/:leafCount/:leafId" shenanigans). Current depth (for the web server) *is* path depth, and max values are determined when building the router, not on call.