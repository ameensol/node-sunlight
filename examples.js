var async = require('async');

var Influence = require('./influence');
var OpenStates = require('./openstates');
var Congress = require('./congress');

// Load apiKey from config.json - you can replace this code and manually set your API key here
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');

var influence = new Influence(apiKey);
var openstates = new OpenStates(apiKey);
var congress = new Congress(apiKey);

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

/*
// Using id and namespace
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


/*
influence.topContributors('4148b26f6f1c437cb50ea9ca4699417a', '2012', '1', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
influence.topIndustries('4148b26f6f1c437cb50ea9ca4699417a', '2012', '1', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/


/*
openstates.metadataOverview(function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.metadataState('nc', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.billSearch({
  q: 'agriculture',
  state: 'ca',
  chamber: 'upper'
}, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.billDetail('nc', '2013', 'HB 589', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.legSearch({
  state: 'dc',
  chamber: 'upper'
}, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.legDetail('NCL000173', function(err, json) {
  if (err) throw err;
  console.log(json.full_name);
});
*/

/*
openstates.geoLookup(35.79, -78.78, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.comSearch({
  state: 'dc'
}, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.comDetail('DCC000029', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.eventSearch({
  state: 'tx'
}, function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.eventDetail('TXE00026474', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
// with the chamber
openstates.districtSearch('nc', 'lower', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
// without the chamber
openstates.districtSearch('nc', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/

/*
openstates.districtBoundary('sldl/nc-120', function(err, json) {
  if (err) throw err;
  console.log(json);
});
*/