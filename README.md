node-sunlight
=============

A node.js wrapper for the Sunlight Foundation Influence Explorer API

Contributions are welcome, check out the docs [here](http://sunlightlabs.github.io/datacommons/index.html) to see what methods are still required. 


## Installation

```
npm install sunlight-influence
```

## Usage

```
var Influence = require('influence');

var influence = new Influence(apiKey);

influence.entityOverview('97737bb56b6a4211bcc57a837368b1a4', null, function(err, json) {
  if (err) throw err;
  console.log(json);
});

// Barack Obama Overview
```

## License
MIT