var async = require('async');
var fs = require('fs');

//var level = require('level');
//var db = level('level.db', { valueEncoding: 'json' });

var Influence = require('./influence');
var OpenStates = require('./openstates');

var nameVariants = require(__dirname + '/resources/nameVariants');

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

// Object to store bill data and methods
function billObj(name, cycles, type) {
  if(!(this instanceof billObj)) return new billObj(name, cycles);
  this.name = name;
  this.cycles = cycles || 2012;
  this.type = type || 'ind'; 
  this.indContrib = {};
  this.orgContrib = {};
  this.hits = 0;
  this.misses = 0;
  this.pols =  [];
  return this;
}

// Get the campaign finance info for all legislators
billObj.prototype.aggVoteMoney = function(callback) {
  var self = this;
  var nexts = 0;
  async.forEach(this.votes, function(element, next) {

    // store individual politician data on the pols array as key-value pairs
    var pol = {
      leg_id: element.leg_id, 
      lastName: element.name,
      id: null
    };
    self.pols.push(pol);

    self.getName(pol, function(err, pol) {
      if(err) {
        console.log(err);
        self.misses += 1;
        return next();
      }
      self.getId(pol, function(err, pol) {
        if (err) {
          console.log(err);
          self.misses += 1;
          return next();
        }
        if (self.type == 'ind') {
          self.getIndContrib(pol, function(err) {
            if (err) {
              console.log(err);
              self.misses += 1;
              return next();
            } else {
              self.hits += 1;
              return next();
            }
          });
        } else if (self.type == 'org') {
          self.getOrgContrib(pol, self.cycles, function(err) {
            if (err) {
              console.log(err);
              self.misses += 1;
              return next();
            } else {
              self.hits += 1;
              return next();
            }
          });
        }
      });
    });

  }, function() {

    if (self.type == 'ind') {
      self.contrib = self.sortResults(self.indContrib);
    } else if (self.type == 'org') {
      self.contrib = self.sortResults(self.orgContrib);
    }

    console.log('****************QUERY COMPLETE!*******************');
    console.log('Year: ' + self.cycles);
    console.log('\nHits: ' + self.hits + ' | Misses: '+ self.misses + '\n');

    // only see the first 20 donors
    self.contrib = self.contrib.splice(0, 19);

    /*
    console.log('**************' + self.name + ' Votes Money Sum******************');
    console.dir(self.contrib);
    */

    self.contrib.forEach(function (el) {
      el[1] = el[1]/self.hits;
    });


    console.log('**************' + self.name + ' Votes Money Avg******************');
    console.dir(self.contrib);
  });
};

// Get a legislator's full name
billObj.prototype.getName = function(pol, cb) {
  openstates.legDetail(pol.leg_id, function (err, json) {
    if(err) {
      return cb(new Error('Leg Detail lookup failed for ' + pol.leg_id));
    }
    pol.full_name = json.full_name;
    return cb(null, pol);
  });
};

// Get the sunlight ID from the full name
billObj.prototype.getId = function(pol, cb) {
  var self = this;

  self.setPosNames(pol, function (possibleNames) {

    async.forEach(possibleNames, function (el, next) {

      influence.entityByName(el, 'politician', function (err, json) {

        // Unsuccessful query
        if (err || typeof json == 'undefined') {
          return next();
        }

        // Successful query
        if (json.length > 0) {
          var id = null;
          if (json.length > 1) {
            json.forEach(function(el) {
              if (el.state == 'NC') {
                pol.id = el.id;
              }
            });
          } else {
            pol.id = json[0].id;
          }
        }
        return next();

      });
    }, function(err) {
      if(err) return cb(err);
      if(pol && pol.id) return cb(null, pol);
      return cb(new Error('ID lookup failed for: ' + pol.full_name));
    });
  });

};

// Creates a list of possible names to lookup for each politician
billObj.prototype.setPosNames = function (pol, cb) {
  var self = this;
  var possibleNames = [pol.full_name];

  async.parallel([
    function(callback) {
      // middle name
      self.removeMiddle(pol.full_name, function (firstLast) {
        if (firstLast) {
          possibleNames.push(firstLast);
          pol.firstLast = firstLast;
        }
        return callback();
      });
    }, function(callback) {
      // first name variant
      self.tryVariant(pol.full_name, function (firstVariant) {
        if (firstVariant) {
          possibleNames.push(firstVariant);
          pol.firstVariant = firstVariant;
        }
        return callback();
      });
  }], function() {
    // middle name and first name variant
    if (pol.firstLast && pol.firstVariant) {
      self.tryVariantLast(pol.firstVariant, function (firstVariantLast) {
        possibleNames.push(firstVariantLast);
        pol.firstVariantLast = firstVariantLast;
      });
    }
  });
  console.log(possibleNames);
  cb(possibleNames);
};

// If the politician has a middle name, try removing it
billObj.prototype.removeMiddle = function (full_name, CB) {
  if (full_name.split(' ').length > 2) {
    firstLast = full_name.split(' ')[0] + ' ' + full_name.split(' ')[2];
    CB(firstLast);
  } else {
    CB(null);
  }
};

// Try a variant of the first name
billObj.prototype.tryVariant = function(full_name, CB) {
  var firstVariant = null;
  var splitName = full_name.split(' ');
  firstName = splitName.shift();
  nameVariants.names.forEach(function(el) {
    if (firstName == el[0]) {
      nameVariant = el[1];
      splitName.unshift(nameVariant);
      firstVariant = splitName.join(' ');
    }
  });
  if (firstVariant) return CB(firstVariant);
  return CB(null);
}; 

// Try removing the middle name and using a first name variant
billObj.prototype.tryVariantLast = function(firstVariant, CB) {
  this.removeMiddle(firstVariant, function(firstVariantLast) {
    if (firstVariantLast) return CB(firstVariantLast);
    return CB(null);
  });
};

// Get the campaign contributions by industry
billObj.prototype.getIndContrib = function(pol, cb) {
  var self = this;
  // console.dir(pol);
  influence.topIndustries(pol.id, self.cycles, null, function(err, json) {
    if (err) {
      return cb(new Error('Campaign Finance lookup ERROR for ' + pol.full_name + ' | err: ' + err.message));
    }
    if (json.length > 0) {

      // increment the contrib object with these results
      json.forEach(function(el, index, array) {
        if(self.type == 'ind') {
          if (el.name in self.indContrib) { 
            self.indContrib[el.name] += parseInt(el.amount);
          } else {
            self.indContrib[el.name] = parseInt(el.amount);
          }
        } else if(self.type == 'org') {
          if (el.name in self.orgContrib) { 
            self.orgContrib[el.name] += parseInt(el.amount);
          } else {
            self.orgContrib[el.name] = parseInt(el.amount);
          }
        }
      });
      return cb(null);
    } else {
      return cb(new Error('Campaign Finance lookup failed for ' + pol.full_name));
    }
  });
}

// Get the campaign contributions by organization
billObj.prototype.getOrgContrib = function(pol, cycles, cb) {
  var self = this;
  // console.dir(pol);
  var foundData = false;
  async.forEach(cycles, function(el, next) {
    influence.topContributors(pol.id, el, null, function(err, json) {
      if (err) {
        return next(new Error('Campaign Finance lookup ERROR for ' + pol.full_name + ' | err: ' + err.message));
      }
      if (json.length > 0) {
        foundData = true;
        // increment the contrib object with these results
        json.forEach(function(el, index, array) {
          if (el.name in self.orgContrib) { 
            self.orgContrib[el.name] += parseInt(el.total_amount);
          } else {
            self.orgContrib[el.name] = parseInt(el.total_amount);
          }
        });
      }
      return next(null);
    });
  }, function(err) {
    if (err) return cb(err);
    if (!foundData) return cb(new Error('Campaign Finance lookup failed for ' + pol.full_name + ' - ' + pol.id));
    return cb(null);
  });
  
};

// sort campaign finance results from largest to smallest
billObj.prototype.sortResults = function(contrib) {
  var self = this;
  var sortable = [];
  for (var contributor in contrib)
    sortable.push([contributor, contrib[contributor]]);
  sortable.sort(function(a, b) {return b[1] - a[1]});
  return sortable;
};

// Get the bill voting records

var noData = new billObj('No', [2010, 2012], 'org');
var yesData = new billObj('Yes', [2010, 2012], 'org');

var state = 'NC';

openstates.billDetail(state, '2013', 'HB 589', function(err, json) {

  console.log('Bill Detail received');

  noData.votes = json.votes[0].no_votes;
  noData.count = json.votes[0].no_count;

  yesData.votes = json.votes[0].yes_votes;
  yesData.count = json.votes[0].yes_count;

  yesData.aggVoteMoney();
  noData.aggVoteMoney();

});