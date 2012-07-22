var fs = require('fs');
var musicmetadata = require('musicmetadata');

var parser = new musicmetadata(fs.createReadStream('levels.mp3'));

parser.on('metadata', function(result) {
  console.log(result);
});
