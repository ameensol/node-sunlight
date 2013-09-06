var async = require('async');
var fs = require('fs');

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

var noData = new billObj('No', {}, 0, 0);
var yesData = new billObj('Yes', {}, 0, 0);


// Object to store bill data and methods
function billObj(name, indContrib, hits, misses) {
  if(!(this instanceof billObj)) return new billObj(indContrib, hits, misses);
  this.name = name;
  this.indContrib = indContrib;
  this.hits = hits;
  this.misses = misses;
  return this;
}

// Get the campaign finance info for all legislators
billObj.prototype.aggVoteMoney = function(callback) {
  var self = this;
  async.forEach(this.votes, function(element, next) {

    self.getName(element, function(err, full_name) {
      if(err) {
        console.log(err);
        return next();
      }
      self.getId(full_name, null, function(err, full_name, id) {
        if (err) {
          console.log(err);
          return next();
        }
        self.getIndContrib(full_name, id, function(err) {
          if (err) {
            console.log(err);
            return next();
          } else {
            // TODO what goes here?
            return next();
          }
        });
      });
    });

  }, function() {

    var sortable = [];
    for (var contributor in self.indContrib)
      sortable.push([contributor, self.indContrib[contributor]]);
    sortable.sort(function(a, b) {return b[1] - a[1]});


    console.log('****************QUERY COMPLETE!*******************');
    console.log('\nHits: ' + self.hits + ' | Misses: '+ self.misses + '\n');

    /*
    console.log('**************' + self.name + ' Votes Money Sum******************');
    console.dir(sortable);
    */

    /*
    Object.keys(self.indContrib).forEach(function(key) {
      self.indContrib[key] = self.indContrib[key]/self.hits;
    });
    */

    sortable.forEach(function(el) {
      el[1] = el[1]/self.hits;
    });

    console.log('**************' + self.name + ' Votes Money Avg******************');
    console.dir(sortable);
  });
};

// Get a legislator's full name
billObj.prototype.getName = function(el, cb) {
  openstates.legDetail(el.leg_id, function(err, json) {
    if(err) {
      return cb(new Error('Leg Detail lookup failed for ' + el.leg_id));
    }
    var full_name = json.full_name;
    return cb(null, full_name);
  });
};

// Get the sunlight ID from the full name
billObj.prototype.getId = function(full_name, nameVariant, cb) {
  var self = this;
  influence.entityByName(full_name, 'politician', function(err, json) {
    if (json.length > 0) {
        var id = null;
        if (json.length > 1) {
          json.forEach(function(el) {
            if (el.state == 'NC') {
              id = el.id;
            }
          });
        } else {
          id = json[0].id;
        }
      cb(null, full_name, id);
    } else {
      // If the person has a middle name, search again my just their first and last.
      if (full_name.split(' ').length > 2) {
        firstLast = full_name.split(' ')[0] + ' ' + full_name.split(' ')[2];
        self.getId(firstLast, null, cb);
      } else {
        // Try a name variant of the first name
        if (!nameVariant) {
          var splitName = full_name.split(' ');
          firstName = splitName.shift();
          nameVariants.names.forEach(function(el) {
            if (firstName == el[0]) {
              nameVariant = el[1];
              splitName.unshift(nameVariant);
              full_name = splitName.join(' ');
              self.getId(full_name, true, cb); 
            }
          });
          if (!nameVariant) {
            self.misses += 1;
            return cb(new Error('ID lookup failed for ' + full_name));
          }
        } else {
          self.misses += 1;
          return cb(new Error('ID lookup failed for ' + full_name));
        }
      }
    }
  });
};

// Get the campaign contributions by industry
billObj.prototype.getIndContrib = function(full_name, id, cb) {
  var self = this;
  influence.topIndustries(id, 2012, null, function(err, json) {
    if (!json) {
      self.misses += 1;
      return cb(new Error('Campaign Finance lookup failed for ' + full_name));
    }
    if (json.length > 0) {
      json.forEach(function(el, index, array) {
        if (el.name in self.indContrib) { 
          self.indContrib[el.name] += parseInt(el.amount);
        } else {
          self.indContrib[el.name] = parseInt(el.amount);
        }
      });
      self.hits += 1;
      return cb(null);
    } else {
      self.misses += 1;
      return cb(new Error('Campaign Finance lookup failed for ' + full_name));
    }
  });
};

/*
// Get the campaign contributions by organization
billObj.prototype.getOrgContrib = function(full_name, id, cb) {
  var self = this;
  influence.topContributors(id, 2012, null, function(err, json) {
    if (json.length > 0) {
      json.forEach(function(el, index, array) {
        if (el.name in self.indContrib) { 
          self.orgContrib[el.name] += parseInt(el.amount);
        } else {
          self.orgContrib[el.name] = parseInt(el.amount);
        }
      });
      self.hits += 1;
      return cb(null);
    } else {
      self.misses += 1;
      return cb(new Error('Campaign Finance lookup failed for ' + full_name));
    }
  });
};
*/


// Get the bill voting records

var state = 'NC';

openstates.billDetail(state, '2013', 'HB 589', function(err, json) {

  noData.votes = json.votes[0].no_votes;
  noData.count = json.votes[0].no_count;

  yesData.votes = json.votes[0].yes_votes;
  yesData.count = json.votes[0].yes_count;

  yesData.aggVoteMoney();
  noData.aggVoteMoney();

});


/*
var full_name = "James Dixon";

influence.entityByName(full_name, 'politician', function(err, json) {
  //console.log(json);
  var state = "NC";
  var id = null;
  console.log(json);
  if (json.length > 1) {
    json.forEach(function(el) {
      if (el.state == state) {
        console.log(el.id);
        id = el.id;
      }
    });
  } else {
    id = json[0].id;
  }
  console.log(id);
  influence.topContributors(id, 2012, null, function(err, json) {
    console.log(json);
  });
});
*/