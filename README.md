# sirenlint

A lint tool for validating Siren (http://sirenspec.org).

## Usage

### CLI

```
$ sirenlint <siren-file>
```

...or...

```
$ cat <siren-file> | sirenlint
```

### Library

```js
var fs = require('fs');
var path = require('path');
var validate = require('sirenlint');

var FILENAME = path.join(__dirname, '..', 'example', 'test.json');

var subject = fs.readFileSync(FILENAME);

var results = validate(subject);

results.forEach(function(r) {
  if (r instanceof validate.ValidationWarning) {
    console.log('WARN:', r);
  } else if (r instanceof validate.ValidationError) {
    console.log('ERROR:', r);
  }
});

```

## Install

```
npm install sirenlint -g
```

## License

MIT
