var test = require('tape');
var ERRORS = require('../errors');
var WARNINGS = require('../warnings');
var validate = require('../validate');

function errors(results) {
  return results.filter(function(r) {
    return r instanceof validate.ValidationError;
  });
}

function warnings(results) {
  return results.filter(function(r) {
    return r instanceof validate.ValidationWarning;
  });
}

test('invalid json', function(t) {
  var invalid = '{"}';

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message.split('\n')[0], ERRORS.INVALID_JSON);
  t.deepEqual(results[0].segments, []);
  t.equal(results[0].value, invalid);
  t.end();
});

test('root class is not array', function(t) {
  var invalid = JSON.stringify({
    class: true,
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['class']);
  t.equal(results[0].value, true);
  t.end();
});

test('root class has invalid item', function(t) {
  var invalid = JSON.stringify({
    class: ['a', 'b', 3],
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASS_NOT_STRING);
  t.deepEqual(results[0].segments, ['class', 2]);
  t.equal(results[0].value, 3);
  t.end();
});

test('root properties is not an object', function(t) {
  var invalid = JSON.stringify({
    properties: [12345],
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.PROPERTIES_NOT_OBJECT);
  t.deepEqual(results[0].segments, ['properties']);
  t.deepEqual(results[0].value, [12345]);
  t.end();
});

test('root sub-entities is an array', function(t) {
  var invalid = JSON.stringify({
    entities: {},
    links: [ { rel: ['self'], href: '' } ]
  });

  var results = validate(invalid);
  
  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.SUB_ENTITIES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities']);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('root sub-entity is missing rel attribute', function(t) {
  var invalid = JSON.stringify({
    entities: [
      { rel: 'self' }, {}
    ],
    links: [ { rel: ['self'], href: '' } ]
  });

  var results = validate(invalid);
  results = errors(validate(invalid));

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.SUB_ENTITY_MISSING_REL);
  t.deepEqual(results[0].segments, ['entities', 1]);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('root links attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    links: {}
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINKS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['links']);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('root links item has invalid class', function(t) {
  var invalid = JSON.stringify({
    links: [{
      class: 0,
      rel: ['self'],
      href: 'http://example.com'
    }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['links', 0, 'class']);
  t.equal(results[0].value, 0);
  t.end();
});

test('root links item is missing rel', function(t) {
  var invalid = JSON.stringify({
    links: [{
      href: 'http://example.com'
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_MISSING_REL);
  t.deepEqual(results[0].segments, ['links', 0]);
  t.deepEqual(results[0].value, { href: 'http://example.com' });
  t.end();
});

test('root links item rel is not an array', function(t) {
  var invalid = JSON.stringify({
    links: [{
      href: 'http://example.com',
      rel: null
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_RELS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['links', 0]);
  t.deepEqual(results[0].value, { href: 'http://example.com', rel: null });
  t.end();
});

test('root links item rel item is not a string', function(t) {
  var invalid = JSON.stringify({
    links: [{
      href: 'http://example.com',
      rel: ['self', 0]
    }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_REL_NOT_STRING);
  t.deepEqual(results[0].segments, ['links', 0, 'rel', 1]);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root links item href is missing', function(t) {
  var invalid = JSON.stringify({
    links: [{
      rel: ['self']
    }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_MISSING_HREF);
  t.deepEqual(results[0].segments, ['links', 0]);
  t.deepEqual(results[0].value, { rel: ['self'] });
  t.end();
});

test('root links item href is not a string', function(t) {
  var invalid = JSON.stringify({
    links: [{
      href: null,
      rel: ['self']
    }]
  });

  var results = validate(invalid);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_HREF_NOT_STRING);
  t.deepEqual(results[0].segments, ['links', 0, 'href']);
  t.equal(results[0].value, null);
  t.end();
});

test('root links item type is not a string', function(t) {
  var invalid = JSON.stringify({
    links: [{
      type: 0,
      rel: ['self'],
      href: ''
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments, ['links', 0, 'type']);
  t.equal(results[0].value, 0);
  t.end();
});

test('root links item title is not a string', function(t) {
  var invalid = JSON.stringify({
    links: [{
      title: 0,
      rel: ['self'],
      href: ''
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments, ['links', 0, 'title']);
  t.equal(results[0].value, 0);
  t.end();
});

test('root is missing self link', function(t) {
  var invalid = JSON.stringify({
    links: [{
      rel: ['item'],
      href: ''
    }]
  });

  var results = validate(invalid);
  results = warnings(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, WARNINGS.MISSING_SELF_LINK);
  t.deepEqual(results[0].segments, ['links']);
  t.end();
});

test('root actions attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    actions: {}
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTIONS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['actions']);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('root action is missing name', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      href: ''
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_MISSING_NAME);
  t.deepEqual(results[0].segments, ['actions', 0]);
  t.deepEqual(results[0].value, { href: '' });
  t.end();
});

test('root action name is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 0,
      href: ''
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_NAME_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'name']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action method is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      method: 0,
      href: ''
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_METHOD_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'method']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action is missing href', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip'
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_MISSING_HREF);
  t.deepEqual(results[0].segments, ['actions', 0]);
  t.deepEqual(results[0].value, { name: 'zip' });
  t.end();
});

test('root action href is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: 0
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_HREF_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'href']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action title is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      title: 0
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'title']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action type is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      type: 0
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'type']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action fields is not an array', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: 0
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELDS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action field is missing name', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: [{}]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_MISSING_NAME);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields', 0]);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('root action field name is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: [{ name: 0 }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_NAME_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields', 0, 'name']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action field title is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: [{ name: 'a', title: 0 }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields', 0, 'title']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action field type is not a string', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: [{ name: 'a', type: 0 }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields', 0, 'type']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('root action field type is unknown', function(t) {
  var invalid = JSON.stringify({
    actions: [{
      name: 'zip',
      href: '',
      fields: [{ name: 'a', type: 'mystery' }]
    }],
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);
  results = warnings(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, WARNINGS.UNKNOWN_FIELD);
  t.deepEqual(results[0].segments, ['actions', 0, 'fields', 0, 'type']);
  t.deepEqual(results[0].value, 'mystery');
  t.end();
});
