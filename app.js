/**
 * Sample inbound integration showing how to use Twilio Flex
 * with Symbl's websocket API as the inbound audio stream
 */

/* import necessary modules for the web-socket API */
require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
var path = require("path");
const sdk = require("symbl-node").sdk;
const bodyParser = require("body-parser");
const zoomParser = require("./zoomParser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/join", (req, res) => {
  //console.log(req.body);
  const sample = req.body.meetingInvite;
  const parser = zoomParser();
  if (parser.isValid(sample)) {
    const result = parser.parse(sample);
    result.then((data) => {
      sdk
        .init({
          appId: process.env.APP_ID,
          appSecret: process.env.APP_SECRET,
          basePath: "https://api.symbl.ai",
        })
        .then(() => {
          console.log("SDK Initialized");
          sdk
            .startEndpoint({
              endpoint: {
                type: "pstn",
                phoneNumber: data.joiningDetails[0].phoneNumbers[0],
                dtmf: data.joiningDetails[0].dtmf,
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
  } else {
    res.sendFile(path.join(__dirname + "/error.html"));
  }
});

var port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log("Example app listening on port " + port + "!");
});
