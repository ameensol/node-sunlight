var SunlightClient = require('./sunlight');

// Load apiKey from config.json - you can replace this code and manually set your API key here
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');

var sunlight = new SunlightClient(apiKey);


sunlight.entityByName('Barack Obama', 'politician', function(err, res) {
  console.log(res);
});