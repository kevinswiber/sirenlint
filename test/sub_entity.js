var test = require('tape');
var ERRORS = require('../errors');
var validate = require('../validate');

test('sub-entity class is not array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], class: true }]
  });

  var errors = validate(invalid);

  console.log(errors);
  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['entities', 0, 'class']);
  t.equal(errors[0].value, true);
  t.end();
});

test('sub-entity class has invalid item', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], class: ['a', 'b', 3] }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASS_NOT_STRING);
  t.deepEqual(errors[0].segments, ['entities', 0, 'class', 2]);
  t.equal(errors[0].value, 3);
  t.end();
});

test('sub-entity properties is not an object', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], properties: [12345] }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.PROPERTIES_NOT_OBJECT);
  t.deepEqual(errors[0].segments, ['entities', 0, 'properties']);
  t.deepEqual(errors[0].value, [12345]);
  t.end();
});

test('sub-entity sub-entities is an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], entities: {} }]
  });

  var errors = validate(invalid);
  
  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.SUB_ENTITIES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['entities', 0, 'entities']);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('sub-entity sub-entity is missing rel attribute', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], entities: [ { rel: ['item'] }, {} ] }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.SUB_ENTITY_MISSING_REL);
  t.deepEqual(errors[0].segments, ['entities', 0, 'entities', 1]);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('sub-entity links attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], links: {} }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.LINKS_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['entities', 0, 'links']);
  t.deepEqual(errors[0].value, {});
  t.end();
});

test('sub-entity links item has invalid class', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        class: 0,
        rel: ['next'],
        href: 'http://example.com'
      }]
    }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(errors[0].segments, ['entities', 0, 'links', 0, 'class']);
  t.equal(errors[0].value, 0);
  t.end();
});

test('sub-entity links item is missing rel', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        href: 'http://example.com'
      }]
    }]
  });

  var errors = validate(invalid);

  t.equal(errors.length, 1);
  t.equal(errors[0].message, ERRORS.LINK_MISSING_REL);
  t.deepEqual(errors[0].segments, ['entities', 0, 'links', 0]);
  t.deepEqual(errors[0].value, { href: 'http://example.com' });
  t.end();
});
