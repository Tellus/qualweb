// Use this file only as a guide for first steps using middleware variants. You can delete it when you have understood the concepts.
// For a detailed explanation about using middlewares, visit:
// https://mocks-server.org/docs/usage/variants/middlewares

module.exports = [
  {
    id: "long-chain", //route id
    url: "/loop/:id", // url in express format
    method: ["GET", "POST", "PUT", "PATCH"], // HTTP methods
    variants: [
      {
        id: "looping", // variant id
        type: "middleware", // variant handler id
        options: {
          // Express middleware to execute
          middleware: (req, res, _next, _core) => {
            console.debug(req.params);
            res.status(200);
            res.send(`<html><head></head><body><div>Hi, there!</div></body></html>`);
          },
        },
      },
    ],
  },
];
