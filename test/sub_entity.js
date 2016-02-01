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

test('sub-entity class is not array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], class: true }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'class']);
  t.equal(results[0].value, true);
  t.end();
});

test('sub-entity class has invalid item', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], class: ['a', 'b', 3] }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASS_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'class', 2]);
  t.equal(results[0].value, 3);
  t.end();
});

test('sub-entity properties is not an object', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], properties: [12345] }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.PROPERTIES_NOT_OBJECT);
  t.deepEqual(results[0].segments, ['entities', 0, 'properties']);
  t.deepEqual(results[0].value, [12345]);
  t.end();
});

test('sub-entity sub-entities is an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], entities: {} }]
  });

  var results = validate(invalid);
  results = errors(results);
  
  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.SUB_ENTITIES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'entities']);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('sub-entity sub-entity is missing rel attribute', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], entities: [ { rel: ['item'] }, {} ] }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.SUB_ENTITY_MISSING_REL);
  t.deepEqual(results[0].segments, ['entities', 0, 'entities', 1]);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('sub-entity links attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{ rel: ['item'], links: {} }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINKS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'links']);
  t.deepEqual(results[0].value, {});
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

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.CLASSES_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'links', 0, 'class']);
  t.equal(results[0].value, 0);
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

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_MISSING_REL);
  t.deepEqual(results[0].segments, ['entities', 0, 'links', 0]);
  t.deepEqual(results[0].value, { href: 'http://example.com' });
  t.end();
});

test('sub-entity links item rel is not an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        href: 'http://example.com',
        rel: null
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_RELS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'links', 0]);
  t.deepEqual(results[0].value, { href: 'http://example.com', rel: null });
  t.end();
});

test('sub-entity links item rel item is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        href: 'http://example.com',
        rel: ['item', 0]
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_REL_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'links', 0, 'rel', 1]);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity links item href is missing', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        rel: ['item']
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_MISSING_HREF);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'links', 0]);
  t.deepEqual(results[0].value, { rel: ['item'] });
  t.end();
});

test('sub-entity links item href is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        href: null,
        rel: ['item']
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_HREF_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'links', 0, 'href']);
  t.equal(results[0].value, null);
  t.end();
});

test('sub-entity links item type is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        type: 0,
        rel: ['item'],
        href: ''
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'links', 0, 'type']);
  t.equal(results[0].value, 0);
  t.end();
});

test('sub-entity links item title is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      links: [{
        title: 0,
        rel: ['item'],
        href: ''
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.LINK_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'links', 0, 'title']);
  t.equal(results[0].value, 0);
  t.end();
});

test('sub-entity is missing self link', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      links: [{
        rel: ['item'],
        href: ''
      }]
    }],
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);
  results = warnings(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, WARNINGS.MISSING_SELF_LINK);
  t.deepEqual(results[0].segments, ['entities', 0, 'links']);
  t.end();
});

test('sub-entity actions attribute is not an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: {}
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTIONS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions']);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('sub-entity action is missing name', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        href: ''
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_MISSING_NAME);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0]);
  t.deepEqual(results[0].value, { href: '' });
  t.end();
});

test('sub-entity action name is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 0,
        href: ''
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_NAME_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'name']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action method is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        method: 0,
        href: ''
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_METHOD_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'method']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action is missing href', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip'
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_MISSING_HREF);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0]);
  t.deepEqual(results[0].value, { name: 'zip' });
  t.end();
});

test('sub-entity action href is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: 0
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_HREF_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'href']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action title is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        title: 0
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'title']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action type is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        type: 0
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'type']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action fields is not an array', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: 0
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELDS_NOT_ARRAY);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'fields']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action field is missing name', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: [{}]
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_MISSING_NAME);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'fields', 0]);
  t.deepEqual(results[0].value, {});
  t.end();
});

test('sub-entity action field name is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: [{ name: 0 }]
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_NAME_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'actions', 0, 'fields', 0, 'name']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action field title is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: [{ name: 'a', title: 0 }]
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_TITLE_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'actions', 0, 'fields', 0, 'title']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action field type is not a string', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: [{ name: 'a', type: 0 }]
      }]
    }]
  });

  var results = validate(invalid);
  results = errors(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, ERRORS.ACTION_FIELD_TYPE_NOT_STRING);
  t.deepEqual(results[0].segments,
      ['entities', 0, 'actions', 0, 'fields', 0, 'type']);
  t.deepEqual(results[0].value, 0);
  t.end();
});

test('sub-entity action field type is unknown', function(t) {
  var invalid = JSON.stringify({
    entities: [{
      rel: ['item'],
      actions: [{
        name: 'zip',
        href: '',
        fields: [{ name: 'a', type: 'mystery' }]
      }],
      links: [{ rel: ['self'], href: '' }]
    }],
    links: [{ rel: ['self'], href: '' }]
  });

  var results = validate(invalid);
  results = warnings(results);

  t.equal(results.length, 1);
  t.equal(results[0].message, WARNINGS.UNKNOWN_FIELD);
  t.deepEqual(results[0].segments, ['entities', 0, 'actions', 0, 'fields', 0, 'type']);
  t.deepEqual(results[0].value, 'mystery');
  t.end();
});
