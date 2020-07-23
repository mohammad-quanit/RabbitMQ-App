#!/usr/bin/env node

const express = require("express");
const app = express();
var amqp = require("amqplib/callback_api");
const nodemailer = require("nodemailer");

const port = 3002;

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mquanit.kingdomvision@gmail.com",
    pass: "danzakuduro",
  },
});

amqp.connect("amqp://localhost", function (error0, connection) {
  if (error0) throw error0;

  connection.createChannel((err, ch) => {
    if (err) throw err;
    let queue = "PayloadQueue";
    ch.assertQueue(queue, { durable: false });
    console.log("Waiting for message in ... " + queue);
    ch.consume(
      queue,
      (msg) => {
        let { email } = JSON.parse(msg.content);
        transporter.sendMail(
          {
            from: "mquanit.kingdomvision@gmail.com",
            to: email,
            subject: "Nodejs Microservices tutorial",
            text: `Hello muhammad quanit from microservices app 👻`,
          },
          (emailErr, info) => {
            if (emailErr) throw emailErr;
            console.log(`Email sent ${info.response}`);
          }
        );
      },
      { noAck: true }
    );
  });
});

app.listen(port, () => console.log("Receiving on port 3002..."));
