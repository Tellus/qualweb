// Use this file only as a guide for first steps using middleware variants. You can delete it when you have understood the concepts.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/usage/variants/middlewares

module.exports = [
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
    id: 'infinite-links', //route id
    url: '/loop/:maxLinks/:currentLink', // url in express format
    method: ['GET'], // HTTP methods
    variants: [
      {
        id: 'base', // variant id
        type: 'middleware', // variant handler id
        options: {
          // Express middleware to execute
          middleware: (req, res) => {
            res.status(200);

            const maxLinks = Number.parseInt(req.params.maxLinks);
            const currentLink = Number.parseInt(req.params.currentLink);

            if (maxLinks > currentLink) {
              return res.send(`<html>
                <head></head>
                <body>
                  <h1>Blimey</h1>
                  <div>
                    <a href='/loop/${req.params.maxLinks}/${Number.parseInt(req.params.currentLink) + 1}'>
                      Link
                    </a>
                  </div>
                </body>
              </html>`);
            } else {
              return res.send(`<html><head></head><body><h1>End of chain!</h1><div></div></body></html>`);
            }
          },
        },
      },
    ],
  },
];
