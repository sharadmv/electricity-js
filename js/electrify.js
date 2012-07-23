var sp = require('serialport');
var SerialPort = sp.SerialPort;
port = "/dev/ttyACM0";
var serialPort = new SerialPort(port,{
  parser:sp.parsers.readline('\n')
});
var translate = {
  "1:on":"a",
  "1:off":"b",
  "1:tx":"c",
  "2:on":"d",
  "2:off":"e",
  "2:tx":"f", "3:on":"g",
  "3:off":"h",
  "3:tx":"i"
}
var Model = {
  Powerstrip : function(id) {
    this.state = true;
    this.id = id;
    this.on = function() {
      serialPort.write(translate[id+":"+"on"]);
      //this.state = true;
    }
    this.off = function() {
      serialPort.write(translate[id+":"+"off"]);
    }
    this.toggle = function() {
      if (this.state) {
        this.off();
      } else {
        this.on();
      } 
    }
    this.set = function(val) {
      this.state = val;
    }
    this.tx = function(val) {
      serialPort.write(translate[id+":"+"tx"]);
    }
  }
}
serialPort.on('data',function(data){
  data = data.trim();
  var splt = data.split(":");
  var id = splt[0];
  var dt = splt[1];
  if (parseFloat(dt)) {
    for (var cb in dataCallbacks) {
      dataCallbacks[cb](id, parseFloat(dt));
    }
  } else {
    if (dt == "on") {
      if (powerstrips[id]) {
        powerstrips[id].set(true);
      }
    } else if (dt == "off") {
      if (powerstrips[id]) {
        powerstrips[id].set(false);
      }
    }
  }
});

var powerstrips = {};

var dataCallbacks = [];
var addPowerstrip = function(id) {
  var ps = new Model.Powerstrip(id);
  powerstrips[id] = ps;
}
var interface = {
  on : function(id) {
    powerstrips[id].on();
  },
  off : function(id) {
    powerstrips[id].off();
  },
  toggle : function(id) {
    powerstrips[id].toggle();
  },
  state : function(id) {
    if (powerstrips[id]) {
      return powerstrips[id].state;
    }
  },
  tx : function(id) {
    powerstrips[id].tx();
  },
  onData : function(cb) {
    dataCallbacks.push(cb);
  }
}
addPowerstrip(1);
addPowerstrip(2);
addPowerstrip(3);
var getTx = function(id) {
  (function(i){ 
    setInterval(function() {
      powerstrips["1"].tx();
      powerstrips["2"].tx();
      powerstrips["3"].tx();
    }, 1000);
  })(id);
};
setTimeout(function() {
  getTx("1");
}, 250);
setTimeout(function() {
  getTx("2");
}, 500);
setTimeout(function() {
  getTx("3");
}, 750);
module.exports = interface;
