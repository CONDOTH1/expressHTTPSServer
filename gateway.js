var fs = require('fs');
var express = require('express');
var bodyParser = require("body-parser");
var https = require('https');
var key = fs.readFileSync('./certs/server.key');
var cert = fs.readFileSync('./certs/server.crt')
var https_options = {
    key: key,
    cert: cert
};
var PORT = 8000;
var HOST = 'localhost';
app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);


// routes
app.get('/hey', function(req, res) {
    // console.log(`${req.method} request for ${req.url}`);
    res.send('HEY!');
});

app.post('/RFQfromHUB', function(req, res) {
    let message = req.body.message
    // console.log(`${req.method} request for ${req.url}`);
    console.log('This is the RFQ from the hub at the Gateway: ' + message);
    sendToFSI(message);
    res.send('HO!');
});

app.post('/responseFromFSI', function(req, res) {
    let message = req.headers.messages
    // console.log(`${req.method} request for ${req.url}`);
    console.log('This is the response message from the FSI: ' + message);
    res.send('HO!\n');
});


var sendToFSI = function(message){

  let agentOptions = {
	   key: fs.readFileSync('./certs/server.key'),
	   cert: fs.readFileSync('./certs/server.crt'),
  };

  let agent = new https.Agent(agentOptions);

  var options = {
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

  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });
  req.end();
};
