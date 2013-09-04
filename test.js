var async = require('async');

var Influence = require('./influence');
var OpenStates = require('./openstates');

// Load apiKey from config.json - you can replace this code and manually set your API key here
var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');

var influence = new Influence(apiKey);
var openstates = new OpenStates(apiKey);

/* TODO clean up this section of code, this is a custom script, not a part of examples.
 * I need a way of waiting until all the data has been accumulated before giving out the final information
 * I have to only count the number of politicians that I could successfully get data for in the average (don't divide by total pols)
 * I need to execute the different steps of this in series, but run all the politician lookups in parallel, but then wait until all are done
 * to give the final data...
 */

openstates.billDetail('nc', '2013', 'HB 589', function(err, json) {
  //console.log(json.votes[0]);
  var yesVotes = json.votes[0].yes_votes;
  var yesCount = json.votes[0].yes_count;
  //console.log(yesVotes);
  var noVotes = json.votes[0].no_votes;
  var noCount = json.votes[0].no_count;
  //console.log(noVotes);

  var yesMoneyByInd = {};

  var yesHit = 0,
      yesMiss = 0;

  async.forEach(yesVotes, function(element, next) {
    // Get the legislator's full name
    openstates.legDetail(element.leg_id, function(err, json) {
      var full_name = json.full_name;

      // Get the sunlight ID from the full name
      influence.entityByName(full_name, 'politician', function(err, json) {
        if (json.length > 0) {
          var id = json[0].id;
          
          // Get the campaign contributions by industry
          influence.topIndustries(id, 2012, null, function(err, json) {
            if (json.length > 0) {
              json.forEach(function(el, index, array) {
                if (el.name in yesMoneyByInd) {
                  yesMoneyByInd[el.name] += parseInt(el.amount);
                } else {
                  yesMoneyByInd[el.name] = parseInt(el.amount);
                }
              });
              yesHit += 1;
              return next();
            } else {
              console.log('Campaign Finance lookup failed for ' + full_name);
              yesMiss += 1;
              return next();
            }
          });
        } else {
          console.log('ID lookup failed for ' + full_name);
          yesMiss += 1;
          return next();
        }
      });
    });
  }, function() {
    
    console.log('****************QUERY COMPLETE!*******************');
    console.log('\nHits: ' + yesHit + ' | Misses: '+ yesMiss + '\n');

    console.log('**************Yes Votes Money Sum******************');
    console.dir(yesMoneyByInd);

    Object.keys(yesMoneyByInd).forEach(function(key) {
      yesMoneyByInd[key] = yesMoneyByInd[key]/yesHit;
    });

    console.log('**************Yes Votes Money Avg******************');
    console.dir(yesMoneyByInd);
  });

  var noMoneyByInd = {};

  var noHit = 0,
      noMiss = 0;

  async.forEach(noVotes, function(element, next) {
    // Get the legislator's full name
    openstates.legDetail(element.leg_id, function(err, json) {
      var full_name = json.full_name;

      // Get the sunlight ID from the full name
      influence.entityByName(full_name, 'politician', function(err, json) {
        if (json.length > 0) {
          var id = json[0].id;
          
          // Get the campaign contributions by industry
          influence.topIndustries(id, 2012, null, function(err, json) {
            if (json.length > 0) {
              json.forEach(function(el, index, array) {
                if (el.name in noMoneyByInd) {
                  noMoneyByInd[el.name] += parseInt(el.amount);
                } else {
                  noMoneyByInd[el.name] = parseInt(el.amount);
                }
              });
              noHit += 1;
              return next();
            } else {
              console.log('Campaign Finance lookup failed for ' + full_name);
              noMiss += 1;
              return next();
            }
          });
        } else {
          console.log('ID lookup failed for ' + full_name);
          noMiss += 1;
          return next();
        }
      });
    });
  }, function() {
    
    console.log('****************QUERY COMPLETE!*******************');
    console.log('\nHits: ' + noHit + ' | Misses: '+ noMiss + '\n');

    console.log('**************No Votes Money Sum******************');
    console.dir(noMoneyByInd);

    Object.keys(noMoneyByInd).forEach(function(key) {
      noMoneyByInd[key] = noMoneyByInd[key]/noHit;
    });

    console.log('**************No Votes Money Avg******************');
    console.dir(noMoneyByInd);
  });
});