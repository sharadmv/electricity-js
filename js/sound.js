var Buffer = require('buffertools');
var fs = require('fs');
var curSpeak = null;
var speaking = false;
var sampleRate = 32000;
var spawn = require('child_process').spawn;
var SPEAKING_THRESHOLD = -20;
var record = spawn('rec',['-b','16','-e','signed-integer','-c','1','-r',sampleRate,'-p']);
var callbacks = [];
record.stdout.on('data', function (d) {
  fs.writeFile('temp',d);
  var process = spawn('sox',['-b','16','-e','signed-integer','-c','1','-r',sampleRate,'-t','raw','temp','-n','stats']);
  process.stderr.on('data',function(data){
    var stats = data.toString('ascii').trim();
    var spt = stats.split("\n");
    for (var i in spt){
      if (typeof(spt[i]) == "string") {
        if (spt[i].indexOf("RMS lev dB")!=-1){
          var vol = parseFloat(spt[i].match(/[-]?[0-9]+\.[0-9]+/)[0]);
          if (vol > SPEAKING_THRESHOLD){
            for (var i in callbacks) {
              callbacks[i]();
            }
          } else {
          }
        }
      }
    }
  });
});

record.stderr.on('data', function (data) {
});

record.on('exit', function (code) {
  if (code !== 0) {
    console.log('record process exited with code ' + code);
  }
  process.stdin.end();
});
var interface = {
  clap : function(cb) {
    callbacks.push(cb);
  }
}
module.exports = interface;
