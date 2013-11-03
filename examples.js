var async = require('async');

var Influence = require('./influence');

// Load apiKey from config.json - you can replace this code and manually set your API key here
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');

var influence = new Influence(apiKey);

/*
influence.entityByName('Barack Obama', 'politician', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

// Using bioguide_id
/*
influence.entityIdLookup(null, null, 'L000551', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

// Using id and namespace
/*
influence.entityById(TODO, TODO, null, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
influence.entityOverview('97737bb56b6a4211bcc57a837368b1a4', null, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
influence.topPoliticians('2006', null, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/



influence.topContributors('4148b26f6f1c437cb50ea9ca4699417a', '2012', null, function(err, json) {
  if (err) throw err;
  console.log(json);
});



influence.topIndustries('4148b26f6f1c437cb50ea9ca4699417a', '2012', null, function(err, json) {
  if (err) throw err;
  console.log(json);
});


/*
influence.unknownIndustries('4148b26f6f1c437cb50ea9ca4699417a', '2012', '1', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/







