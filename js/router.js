var Model = {
  Response:function(data, status, url, query, timestamp, elapsed) {
    this.data = data;
    this.status = status;
    this.url = url;
    this.query = query;
    this.timestamp = timestamp.getTime();
    this.elapsed = elapsed;
  }
};
var interface = {
  wrap : function(response) {
    return new (function(res){
      var wrapped = this;
      this.json = function(json) {
        var status = "success";
        var response = new Model.Response(json, status, res.req.url, res.req.query, wrapped.timestamp, new Date()-wrapped.timestamp);
        res.json(response);
      }
      this.error = function(error) {
        var status = "error";
        var response = new Model.Response(error, status, res.req.url, res.req.query, wrapped.timestamp, new Date()-wrapped.timestamp);
        res.json(response);
      }
      this.res = res;
      this.timestamp = new Date();
    })(response);
  }
}
module.exports = interface;
