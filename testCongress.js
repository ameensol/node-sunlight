var api = require("sunlight-congress-api");

var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');

var success = function(data){
    console.log(data);
}

api.init(apiKey);

api.votes().filter("year", "2012").call(success);