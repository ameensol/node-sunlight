var api = require("sunlight-congress-api");
var Influence = require('./influence');

var nconf = require('nconf');
nconf.use('file', { file: './config.json' });
nconf.load();
var apiKey = nconf.get('apiKey');


// Success Functions

var votesSuccess = function(data) {
  var votes = data.results;
  var amendments = votes.filter(function(el) {
    return el.roll_type.indexOf('Amendment') > 0
  });

  // TODO use that callback flow somehow fuck
  amendments.forEach(function(el) {
    // does including the bill_id make the lookup faster somehow?
    getRoll(el.roll_id, el.bill_id);
  });
}


var rollSuccess = function(data) {
  var voters = data.results[0].voters;

  var yesVotes = [];
  var noVotes = [];

  Object.keys(voters).forEach(function(el) {
    if (voters[el].vote == "Yea") {
      yesVotes.push(voters[el].voter);
    } else if (voters[el].vote == "Nay") {
      noVotes.push(voters[el].voter);
    }
  });
  console.log(yesVotes);
  console.log(noVotes);
}


// get the votes on the bill, expects only 1 bill returned
function getVotes(bill_id) {
  api.votes() 
    .filter("bill_id", bill_id)
    .call(votesSuccess)
}

function getRoll(roll_id) {
  api.votes()
    .filter("bill_id", bill_id)
    .filter("roll_id", roll_id)
    .fields("voters", "question")
    .call(rollSuccess)
}

// init apis
var influence = new Influence(apiKey);
api.init(apiKey);

var bill_id = "s649-113";

getVotes(bill_id);