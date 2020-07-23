const express = require("express");
const app = express();
const amqp = require("amqplib/callback_api");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const port = 3001;

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Register API",
      description: "Register API info",
      contact: {
        name: "mquanit",
      },
      servers: ["http://localhost:3001"],
    },
  },
  // ['.routes/*.js']  ----> responsible for finding api routes
  apis: ["index.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *  get:
 *    description: Use to request hello world
 *    responses:
 *      '200':
 *        description: A successfull Response
 */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/**
 * @swagger
 * /register:
 *  post:
 *    description: Use to post new user and send payload to emai service
 *    responses:
 *      '200':
 *        description: A successfull Response
 */
app.post("/register", (req, res) => {
  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) throw error0;
    connection.createChannel((err, ch) => {
      let queue = "PayloadQueue";
      let msg = JSON.stringify(req.body);
      ch.assertQueue(queue, { durable: false });
      ch.sendToQueue(queue, Buffer.from(msg));
      res.json({ msg });
    });
    // setTimeout(function () {
    //   connection.close();
    //   process.exit(0);
    // }, 500);
  });
});

app.listen(port, () => console.log("Sending from port 3001..."));
