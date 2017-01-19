const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const https = require('https');
const crypto = require('crypto');
const key = fs.readFileSync('./certs/server.key');
const cert = fs.readFileSync('./certs/server.crt');
const https_options = {
    key: key,
    cert: cert,
    ca: cert,
    requestCert: true,
    rejectUnauthorized: false,
    agent: false
};
const PORT = 8000;
const HOST = 'localhost';
const agentOptions = {
   key: fs.readFileSync('./certs/server.key'),
   cert: fs.readFileSync('./certs/server.crt'),
};
const agent = new https.Agent(agentOptions);

app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
server = https.createServer(https_options, app).listen(PORT, HOST);
server.on('connection', (c) => {console.log('insecure connection');});
server.on('secureConnection', (c) =>{console.log('secure connection; client authorized: ', c.authorized);});

console.log('HTTPS Server listening on %s:%s', HOST, PORT);

app.get('/test', (req, res) => {
  console.log('done');
});

app.post('/RFQfromHUB', (req, res) => {
    let timestamp = + new Date()
    let message = req.body.message
    console.log('This is the RFQ from the hub at the Gateway: ' + message);
    sendToFSI(message);
    res.send('Recieved message, thank you, from the Gateway!');
});

app.post('/responseFromFSI', (req, res) => {
    let message = req.headers.messages
    console.log('This is the response from the FSI: ' + message);
    res.send('Recieved your response, thank you, from Gateway!\n');
});

let sendToFSI = (message) => {
  let request_options = {
    hostname: 'localhost',
    port: 8080,
    path: '/iamfsi',
    method: 'POST',
    agent: agent,
	  ca: fs.readFileSync('./certs/server.crt'),
    headers: {
      messages: message
    }
  };

  let req = https.request(request_options, (res) => {});

  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
};
