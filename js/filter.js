Array.prototype.avg = function() {
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) {
    var e = +this[i];
    if(!e && this[i] !== 0 && this[i] !== '0') e--;
    if (this[i] == e) {av += e; cnt++;} }
  return av/cnt;
}
Array.prototype.max = function() {
  var max = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] > max) max = this[i];
  return max;
}
Array.prototype.min = function() {
  var min = this[0];
  var len = this.length;
  for (var i = 1; i < len; i++) if (this[i] < min) min = this[i];
  return min;
}
var interface = {
  AmpFilter : function(length, lowpass, poll, cb) {
    this.length = length;
    this.lowpass = lowpass;
    var vals = [];         
    var amps = [];
    var amp = 0;

    this.add = function(data) {
      if (vals.length > this.length) {
        vals.shift();
      }
      vals.push(data);
      var max = vals.max();
      var min = vals.min();
      amp = (max - 512)/ Math.sqrt(2);
      if (amps.length > this.lowpass) {
        amps.shift();
      }
      amps.push(amp);
    }
    setInterval(function() {
      cb(amps.avg()/19*60);
    }, poll);
  }
}
module.exports = interface;
