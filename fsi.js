const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const https = require('https');
const key = fs.readFileSync('./certs/server.key');
const cert = fs.readFileSync('./certs/server.crt');
const https_options = {
    key: key,
    cert: cert,
    ca: cert,
    requestCert: true,
    rejectUnauthorized: true,
    agent: false
};
const agentOptions = {
   key: fs.readFileSync('./certs/server.key'),
   cert: fs.readFileSync('./certs/server.crt'),
};
const agent = new https.Agent(agentOptions);
const PORT = 8080;
const HOST = 'localhost';
const wait5000 =  ()=> new Promise((resolve, reject)=> {setTimeout(resolve, 5000)})

app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);
server.on('connection', (c) => {console.log('insecure connection');});
server.on('secureConnection', (c) =>{console.log('secure connection; client authorized: ', c.authorized);});

app.post('/iamfsi', (req, res) => {
    let message = req.headers.messages
    console.log('This is the RFQ from the Gateway at the FSI: ' + message);
    res.send('Recieved message, thank you, from FSI!\n');
    wait5000().then(function(){
      sendBackToGateway('Returned Message')
      return wait5000()
  })
});

sendBackToGateway = (message) => {
  const request_options = {
    hostname: 'localhost',
    port: 8000,
    path: '/responseFromFSI',
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
