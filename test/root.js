var test = require('tape');
var ERRORS = require('../errors');
var validate = require('../validate');

test('invalid json', function(t) {
  var invalid = '{"}';

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message.split('\n')[0], ERRORS.INVALID_JSON);
  t.deepEqual(errors[0].segments, []);
  t.equal(errors[0].value, invalid);
  t.end();
});

test('root class is not array', function(t) {
  var invalid = JSON.stringify({
    class: true
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['class']);
  t.equal(errors[0].value, true);
  t.end();
});

test('root class has invalid item', function(t) {
  var invalid = JSON.stringify({
    class: ['a', 'b', 3]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASS_NOT_STRING);
  t.deepEqual(errors[0].segments, ['class', 2]);
  t.equal(errors[0].value, 3);
  t.end();
});

test('root properties is not an object', function(t) {
  var invalid = JSON.stringify({
    properties: [12345]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.PROPERTIES_NOT_OBJECT);
  t.deepEqual(errors[0].segments, ['properties']);
  t.deepEqual(errors[0].value, [12345]);
  t.end();
});

test('root sub-entities is an array', function(t) {
  var invalid = JSON.stringify({
    entities: {}
  });

  var errors = validate(invalid);
  
  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.SUB_ENTITIES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['entities']);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('root sub-entity is missing rel attribute', function(t) {
  var invalid = JSON.stringify({
    entities: [
      { rel: 'self' }, {}
    ]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.SUB_ENTITY_MISSING_REL);
  t.deepEqual(errors[0].segments, ['entities', 1]);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('root links attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    links: {}
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.LINKS_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['links']);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('root links item has invalid class', function(t) {
  var invalid = JSON.stringify({
    links: [{
      class: 0,
      rel: ['next'],
      href: 'http://example.com'
    }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['links', 0, 'class']);
  t.equal(errors[0].value, 0);
  t.end();
});

test('root links item is missing rel', function(t) {
  var invalid = JSON.stringify({
    links: [{
      href: 'http://example.com'
    }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.LINK_MISSING_REL);
  t.deepEqual(errors[0].segments, ['links', 0]);
  t.deepEqual(errors[0].value, { href: 'http://example.com' });
  t.end();
});
