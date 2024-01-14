# Notes on testing the Crawler

The unit tests for the crawler are fairly straight forward to define/design.
Run tests for its functionality, making sure that it can crawl to a finish,
limit itself when parameters say so, fail elegantly, etc, etc, etc.

The bigger challenge is implementing those tests.

## Option 1: request interception in puppeteer

The crawler uses puppeteer for
its functionality, so one enticing approach is to use request interception from
within puppeteer itself to mock responses within the same framework.

Good idea (requires fewer libs), hard to achieve. The crawler **wraps**
puppeteer, so any unit test won't be able to set request interception on the
page objects that get used. We *could* add functionality to do just that, but
it smells a lot of adding API/functionality purely for the sake of being able
to run tests. I could be wrong, but it seems counter-intuitive.

## Option 2: request interception in NodeJS

Another good option might be response mocking from any number of frameworks.
[nock](https://github.com/nock/nock), for example, works by overriding NodeJS'
own request functions, so any requests made within NodeJS will be intercepted
and we can react appropriately.

This does not work for our use case, because puppeteer launches an independent
Chrome instance that has nothing to do with NodeJS. This kind of interception
won't work.

Similar libraries that I checked out:
- [Mock Service Worker](https://github.com/mswjs/msw)
- ... that's it

## Option 3: mock web servers

An option that will work universally is to literally run a local web server that
responds to requests on a local port. It's not interception, so we can't quite
call it mocking, but as the previous two points discussed, proper interception
with cleaner mocking just isn't an option.

The one choice I've found so far is [Mocks Server](https://www.mocks-server.org).
It seems able to do most of what we need, although I'm not sure how to execute
a few of the longer tests without some dumb legwork. In particular, testing
`maxDepth` and `maxUrls` parameters. I *think* we can put together large chains
or trees of interconnected (virtual) pages by defining routes with .js files
(so we can run some logic to build the many responses that need to be ready).

Big drawback of Mocks Server is the complete lack of typings - it's a JS-only
affair.

## Option 4: We BuIlD oUr OwN, with blackjack, and hookers!

The least appealing option (because of the engineering overhead) is to put
together a locally running web server of our own, using httpServer (or
something like Express if we want to be fancy).

In principle, it has the same benefits and issues as other mock web servers,
but we can build it to be very minimal, and serve only our needs.

Should only be considered if we can't find a suitable mock web server elsewhere.