# sirenlint

A lint tool for validating Siren (http://sirenspec.org).

## Usage

### CLI

```
$ sirenlint <siren-file>
```

_or_

```
$ cat <siren-file> | sirenlint
```

#### Example

```
$ echo '{ "links": [ { "rel": ["edit"] } ] }' | sirenlint
{ "links": [ { "rel": ["edit"] } ] }


sirenlint: 2 problems were found

error: ["links",0], Link is missing `href` attribute
warn: ["links"], The main entity is missing a link with a `self` relation
```

#### Output

The `sirentool` command will output the original input followed by a summary of errors and/or warnings.  
The summary includes a stringified JSON array defining the JSON path of the associated error or warning 
and a readable description of the problem.

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
