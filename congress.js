var qs      = require('querystring'),
    request = require('request');

var Congress = module.exports = function(apiKey) {
  if(!apiKey) throw new Error('Must provide API Key');
  this.key = apiKey; 
}

Congress.prototype.makeRequest = function(method, params, callback) {
  // creates and executes an HTTP request 
  var options = this.createOptions(method, params, this.key);
  return this.executeRequest(options, callback);
};

Congress.prototype.createOptions = function(method, params, key) {
  // generates the options for the http request from the method, params, and key
  var query = qs.stringify(params);

  return {
    url: 'https://congress.api.sunlightfoundation.com/' + method + '.json?' + 'apikey=' + key + "&" + query,
    agent: false,
    headers: {
      "User-Agent": "Mozilla/4.0 (compatible; sunlight node.js client)",
      "Content-type": "application/x-www-form-urlencoded"
    }
  };
};

Congress.prototype.executeRequest = function(options, callback) {
  // executes the HTTP request with the given options

  request(options, function(err, res, body) {
    // clearTimeout(timeoutID);
    if (err) return callback(err);
    if (!err && res.statusCode == 200) {
      return callback(null, JSON.parse(body));
    } else {
      return callback(new Error('Request failed with ' + res.statusCode));
    }
  });
}

Congress.prototype.bills = function() {

};

