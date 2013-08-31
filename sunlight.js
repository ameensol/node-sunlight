var qs      = require('querystring'),
    request = require('request');

var SunlightClient = module.exports = function(apiKey) {
  if(!apiKey) throw new Error('Must provide API Key');
  this.key = apiKey; 
}

SunlightClient.prototype.makeRequest = function(method, params, callback) {
  // creates and executes an HTTP request 
  var options = this.createOptions(method, params, this.key);
  return this.executeRequest(options, callback);
};

SunlightClient.prototype.createOptions = function(method, params, key) {
  // generates the options for the http request from the method, params, and key
  var query = qs.stringify(params);

  return {
    url: 'http://transparencydata.org/api/1.0/' + method + '.json?' + 'apikey=' + key + "&" + query,
    agent: false,
    headers: {
      "User-Agent": "Mozilla/4.0 (compatible; sunlight node.js client)",
      "Content-type": "application/x-www-form-urlencoded"
    }
  };
};

SunlightClient.prototype.executeRequest = function(options, callback) {
  // executes the HTTP request with the given options
  console.log(options.url);
  request(options, function(err, res, body) {
    //console.log(res);
    if (!err && res.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback(new Error('Request failed with ' + res.statusCode));
    }
  });
}

/* Search for politicians, individuals, organizations or industries with a given name
 * the 'type' parameter must be 'politician', 'individual', 'organization', or 'industry'
 */
SunlightClient.prototype.entityByName = function(search, type, callback) {
  var params = {
    'search': search,
    'type': type
  };
  this.makeRequest('entities', params, callback);
}