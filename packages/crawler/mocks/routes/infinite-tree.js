// Use this file only as a guide for first steps using middleware variants. You can delete it when you have understood the concepts.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/usage/variants/middlewares

module.exports = [
  {
    id: 'infinite-tree-root',
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
          body: '<html><head></head><body><a href="/tree/10/3/0/0">Initial link!</a></body></html>',
        },
      },
    ],
  },
  {
    id: 'infinite-tree', //route id
    url: '/tree/:maxDepth/:linksPerPage/:currentDepth/:leafId', // url in express format
    method: ['GET'], // HTTP methods
    variants: [
      {
        id: 'base', // variant id
        type: 'middleware', // variant handler id
        options: {
          /**
           * Middleware generates an HTML page with :linksPerPage links that go
           * one step "deeper" into the virtual site map, unless max depth has
           * been reached. Leaf ID is ignored but used simply to differentiate
           * potential paths to the crawler.
           */
          middleware: (req, res) => {
            res.status(200);

            const maxDepth = Number.parseInt(req.params.maxDepth);
            const linksPerPage = Number.parseInt(req.params.linksPerPage);
            const currentDepth = Number.parseInt(req.params.currentDepth);
            const leafId = Number.parseInt(req.params.leafId);

            if (currentDepth > maxDepth) {
              res.status(404);
              return res.send(`<html><head></head><body><div>This page does not exist (depth: ${currentDepth}/${maxDepth}).</div></body></html>`);
            } else if (leafId > linksPerPage) {
              res.status(404);
              return res.send(`<html><head></head><body><div>This page does not exist (too high leaf id, requested ${leafId} but only up to ${linksPerPage} is allowed).</div></body></html>`);
            }

            const links = [];

            // Only populate the list of links if we aren't at max depth. We
            // aren't testing 404 behaviour here, only depth adherence.
            if (currentDepth < maxDepth) {
              for (let i = 0; i < linksPerPage; i++) {
                links.push(`<div><a href="/tree/${maxDepth}/${linksPerPage}/${currentDepth + 1}/${i}">Link ${i}</a></div>`);
              }
            }

            res.status(200);
            return res.send(`<html>
              <head></head>
              <body>
                <div>Depth: ${currentDepth}/${maxDepth}</div>
                <div>Links per page: ${linksPerPage}</div>
                ${links.join('\n')}
              </body>
            </html>`);
          },
        },
      },
    ],
  },
];
