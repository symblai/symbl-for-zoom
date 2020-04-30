/**
 * Sample inbound integration showing how to use Twilio Flex
 * with Symbl's websocket API as the inbound audio stream
 */

/* import necessary modules for the web-socket API */

const express = require("express");
const app = express();
const server = require("http").createServer(app);
var path = require("path");
const sdk = require("symbl-node").sdk;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/join", (req, res) => {
  console.log(req.body);
  sdk
    .init({
      appId: req.body.appId,
      appSecret: req.body.appSecret,
      basePath: "https://api.symbl.ai",
    })
    .then(() => {
      console.log("SDK Initialized");
      sdk
        .startEndpoint({
          endpoint: {
            type: "pstn",
            phoneNumber: req.body.number,
            dtmf: req.body.code ? req.body.code : "",
          },
          actions: [
            {
              invokeOn: "stop",
              name: "sendSummaryEmail",
              parameters: {
                emails: [req.body.email],
              },
            },
          ],
        })
        .then((connection) => {
          const connectionId = connection.connectionId;
          console.log("Successfully connected.", connectionId);
          res.sendFile(path.join(__dirname + "/success.html"));
        })
        .catch((err) => {
          console.error("Error while starting the connection", err);
          res.sendFile(path.join(__dirname + "/error.html"));
        });
    })
    .catch((err) => {
      console.error("Error in SDK initialization.", err);
      res.sendFile(path.join(__dirname + "/error.html"));
    });
});

console.log("Listening at Port 3000");
server.listen(3000);
