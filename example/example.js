var fs = require('fs');
var path = require('path');
var validate = require('../validate');

var FILENAME = path.join(__dirname, 'test.json');

var subject = fs.readFileSync(FILENAME);

var results = validate(subject);

results.forEach(function(r) {
  if (r instanceof validate.ValidationWarning) {
    console.log('WARN:', r);
  } else if (r instanceof validate.ValidationError) {
    console.log('ERROR:', r);
  }
});
