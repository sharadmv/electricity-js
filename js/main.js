var express = require('express');
var electricity = require('./electrify.js');
var router = require('./router.js');
var filter = require('./filter.js');
var app = express.createServer();
var sound = require('./sound.js');
var Bridge = require('bridge-js');
var bridge = new Bridge({ apiKey : "c44bcbad333664b9" });
bridge.connect();
var channel;
var serviceHandler = {
  subscribe : function(handler) {
    bridge.joinChannel("electrify-channel", handler, true); } };
var channelHandler =  {
  broadcast : function(id, data, state, timestamp) {
    console.log(id, data, state);
  }
};
bridge.publishService("electrify-service", serviceHandler);
bridge.joinChannel("electrify-channel", channelHandler, true, function(c) {;
  channel = c;
});
bridge.publishService("electrify", electricity);

app.use(express.bodyParser());
app.get('/api', function(req, res) {
  var res = router.wrap(res);
  res.json(Object.keys(filters));
});
app.get('/api/:id', function(req, res) {
  var res = router.wrap(res);
  res.json(electricity.state(req.params.id));
});
app.get('/api/:id/toggle', function(req, res) {
  electricity.toggle(req.params.id);
  res.json("success");
});
app.get('/api/:id/tx', function(req, res) {
  electricity.tx(req.params.id);
  res.json("success");
});
app.post('/api/:id', function(req, res) {
  var res = router.wrap(res);
  if (req.body.method) {
    electricity[req.body.method](req.params.id);
    if (req.body.method == "toggle") {
      res.json(electricity.state(req.params.id));
    } else {
      res.json("success");
    }
  } else {
    res.error("failure");
  }
});
electricity.onData(function(id, data) {
  channel.broadcast(id, data, electricity.state(id), (new Date()).getTime());
});
sound.clap(function() {
//  console.log("CLAP");
  //electricity.toggle("1");
});
app.listen(8080);
