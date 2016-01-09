var fs = require('fs');
var path = require('path');
var validate = require('../validate');

var FILENAME = path.join(__dirname, 'test.json');

var subject = fs.readFileSync(FILENAME);

var errors = validate(subject);

console.log(errors);
