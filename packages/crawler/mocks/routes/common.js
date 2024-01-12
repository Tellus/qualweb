// Use this file only as a guide for first steps using middleware variants. You can delete it when you have understood the concepts.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/usage/variants/middlewares

module.exports = [
  {
    id: "add-headers", //route id
    url: "/loop/:maxLinks/:currentLink", // url in express format
    method: ["GET", "POST", "PUT", "PATCH"], // HTTP methods
    variants: [
      {
        id: "enabled", // variant id
        type: "middleware", // variant handler id
        options: {
          // Express middleware to execute
          middleware: (req, res) => {
            console.debug(req.params);
            res.status(200);
            res.send(`<html><head></head><body><h1>Blimey</h1><div><a href="/loop/${req.params.maxLinks}/${Number.parseInt(req.params.currentLink) + 1}">Link</a></div></body></html>`);
          },
        },
      },
      {
        id: "disabled", // variant id
        disabled: true,
      },
    ],
  },
];
