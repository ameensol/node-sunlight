var qs      = require('querystring'),
    request = require('request');

var Influence = module.exports = function(apiKey) {
  if(!apiKey) throw new Error('Must provide API Key');
  this.key = apiKey; 
}

Influence.prototype.makeRequest = function(method, params, callback) {
  // creates and executes an HTTP request 
  if (typeof callback != 'function') {
    throw new Error('callback must be a function');
  }
  var options = this.createOptions(method, params, this.key);
  return this.executeRequest(options, callback);
};

Influence.prototype.createOptions = function(method, params, key) {
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

Influence.prototype.executeRequest = function(options, callback) {
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

/* 
 * Search for politicians, individuals, organizations or industries with a given name
 * the 'type' parameter must be 'politician', 'individual', 'organization', or 'industry'
 */
Influence.prototype.entityByName = function(search, type, callback) {
  var params = {
    'search': search,
    'type': type
  };
  this.makeRequest('entities', params, callback);
}

/*
 * Crosswalk between several input ID forms and the transparencydata IDs native to this service
 * See http://sunlightlabs.github.io/datacommons/entities.html for parameter options
 * Accepts either an id and namespace or a bioguide_id, and returns the transparency id
 */
Influence.prototype.entityIdLookup = function(id, namespace, bioguide_id, callback) {
  var params = {}
  if (id && namespace) {
    params.id = id;
    params.namespace = namespace;
  } else if (bioguide_id) {
    params.bioguide_id = bioguide_id;
  } else {
    callback(new Error('Must supply either an id and namespace or bioguide_id'));
  }

  this.makeRequest('entities/id_lookup', params, callback);
}

Influence.prototype.entityOverview = function(entity_id, cycles, callback) {

  var params = {};
  if (cycles && typeof(cycles) == "number") params.cycles = cycles;
  this.makeRequest('entities/' + entity_id, params, callback);

}

Influence.prototype.topPoliticians = function(cycle, limit, callback) {
  var params = {
    'cycle': cycle
  };
  if (limit) params.limit = limit;
  this.makeRequest('aggregates/pols/top_1', params, callback);
}


// The top contributing organizations to a given candidate. Giving is broken down into money given directly
// (by the organization's PAC), versus money given by individuals employed by or associated with the organization.

Influence.prototype.topContributors = function(entity_id, cycle, limit, callback) {
  var params = {
    'cycle': cycle
  };
  if (limit) params.limit = limit;
  this.makeRequest('aggregates/pol/' + entity_id + '/contributors', params, callback);
}

// Top contributing industries, ranked by dollars given.
Influence.prototype.topIndustries = function(entity_id, cycles, limit, callback) {
  var params = {
    'cycles': cycles
  };
  if (limit) params.limit = limit;
  this.makeRequest('aggregates/pol/' + entity_id + '/contributors/industries', params, callback);
}

// Contribution count and total for a politician from unknown industries
Influence.prototype.unknownIndustries = function(entity_id, cycles, limit, callback) {
  var params = {
    'cycles': cycles
  };
  if (limit) params.limit = limit;
  this.makeRequest('aggregates/pol/' + entity_id + '/contributors/industries', params, callback);
}