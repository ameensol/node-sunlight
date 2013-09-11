var qs      = require('querystring'),
    request = require('request');

var OpenStates = module.exports = function(apiKey) {
  if(!apiKey) throw new Error('Must provide API Key');
  this.key = apiKey; 
}

OpenStates.prototype.makeRequest = function(method, params, callback) {
  // creates and executes an HTTP request 
  var options = this.createOptions(method, params, this.key);
  return this.executeRequest(options, callback);
};

OpenStates.prototype.createOptions = function(method, params, key) {
  // generates the options for the http request from the method, params, and key
  var query = qs.stringify(params);

  return {
    url: 'http://openstates.org/api/v1/' + method + '/?' + 'apikey=' + key + '&' + query,
    agent: false,
    headers: {
      "User-Agent": "Mozilla/4.0 (compatible; sunlight node.js client)",
      "Content-type": "application/x-www-form-urlencoded"
    }
  };
};

OpenStates.prototype.executeRequest = function(options, callback) {
  // executes the HTTP request with the given options

  request(options, function(err, res, body) {
    console.dir(options);
    if (!err && res.statusCode == 200) {
      callback(null, JSON.parse(body));
    } else {
      callback(new Error('Request failed with ' + res.statusCode));
    }
  });
};

// Get list of all states with data available and basic metadata about their status
OpenStates.prototype.metadataOverview = function(callback) {
  var params = {};
  this.makeRequest('metadata', params, callback);
};

// Get detailed metadata for a particular state
OpenStates.prototype.metadataState = function(state, callback) {
  var params = {};
  this.makeRequest('metadata/' + state, params, callback);
};

/* Search bills by (almost) any of their attributes, or full text
   For possible params, go to http://sunlightlabs.github.io/openstates-api/bills.html#methods/bill-search
*/
OpenStates.prototype.billSearch = function(params, callback) {
  console.log(params);
  this.makeRequest('bills', params, callback);
};


OpenStates.prototype.billDetail = function(state, session, id, callback) {
  var params = {};
  id = encodeURIComponent(id);
  this.makeRequest('bills/' + state + '/' + session + '/' + id, params, callback);
};

OpenStates.prototype.legDetail = function(leg_id, callback) {
  var params ={};
  this.makeRequest('legislators/' + leg_id, params, callback);
};

