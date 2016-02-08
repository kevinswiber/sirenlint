var jsonlint = require('jsonlint');
var ERRORS = require('./errors');
var WARNINGS = require('./warnings');

var FIELD_TYPES = [
  'hidden', 'text', 'search', 'tel', 'url',
  'email', 'password', 'datetime', 'date',
  'month', 'week', 'time', 'datetime-local', 
  'number', 'range', 'color', 'checkbox',
  'radio', 'file', 'image', 'button'
];

function ValidationError(message, segments, value) {
  if (!(this instanceof ValidationError)) {
    return new ValidationError(message, segments);
  }

  this.message = message;
  this.segments = segments;
  this.value = value;
}

function ValidationWarning(message, segments, value) {
  if (!(this instanceof ValidationWarning)) {
    return new ValidationWarning(message, segments);
  }

  this.message = message;
  this.segments = segments;
  this.value = value;
}

function error(message, segments, value) {
  return new ValidationError(message, segments, value);
}

function warn(message, segments, value) {
  return new ValidationWarning(message, segments, value);
}

var validate = module.exports = function validate(subject) {
  var results = [];
  var subject = subject;
  var segments = [];

  jsonlint.parser.parseError = function(str, hash) {
    var err = 'line '+ hash.loc.first_line +', col '+ hash.loc.last_column +', found: \''+ hash.token +'\' - expected: '+ hash.expected.join(', ') +'.'
    results.push(error(ERRORS.INVALID_JSON + ', ' + err, [], subject));
  };

  try {
    subject = jsonlint.parse(subject.toString('utf8'));
  } catch(err) {
    return results;
  }

  results = results.concat(checkEntity(subject, segments.concat([])));

  return results;
}

function checkEntity(subject, segments) {
  var results = [];

  if (subject.hasOwnProperty('class')) {
    results = results.concat(checkClass(subject.class,
          segments.concat(['class'])));
  }

  if (subject.hasOwnProperty('properties')) {
    results = results.concat(checkProperties(subject.properties,
          segments.concat(['properties'])));
  }

  if (subject.hasOwnProperty('entities')) {
    results = results.concat(checkSubEntities(subject.entities,
          segments.concat(['entities'])));
  }

  if (subject.hasOwnProperty('actions')) {
    results = results.concat(checkActions(subject.actions,
          segments.concat(['actions'])));
  }

  if (subject.hasOwnProperty('links')) {
    results = results.concat(checkLinks(subject.links,
          segments.concat(['links'])));
  }

  if (segments.length === 0 || !subject.hasOwnProperty('href')) {
    var found = false;
    if (subject.hasOwnProperty('links') && Array.isArray(subject.links)) {
      found = subject.links.some(function(l) {
        return l.hasOwnProperty('rel')
               && Array.isArray(l.rel)
               && l.rel.length > 0
               && l.rel.indexOf('self') !== -1;
      });
    }

    if (!found) {
      results.push(warn(WARNINGS.MISSING_SELF_LINK,
            segments.concat(['links']), subject.links));
    }
  }

  if (subject.hasOwnProperty('title')) {
    if (subject.title != null && subject.title !== null
        && typeof subject.title !== 'string') {
      results.push(error(ERRORS.TITLE_TYPE_NOT_STRING,
            segments.concat(['title']), subject.title));
    }
  }

  return results;
}

function checkClass(cls, segments) {
  var results = [];

  if (!Array.isArray(cls)) {
    results.push(error(ERRORS.CLASSES_NOT_ARRAY, segments, cls));
    return results;
  }

  cls.forEach(function(c, i) {
    if (typeof c !== 'string') {
      var err = error(ERRORS.CLASS_NOT_STRING, segments.concat([i]), c);
      results.push(err);
    }
  });

  return results;
}

function checkProperties(properties, segments) {
  var results = [];

  if (typeof properties !== 'object' || Array.isArray(properties)) {
    var err = error(ERRORS.PROPERTIES_NOT_OBJECT, segments, properties);
    results.push(err);
  }

  return results;
}

function checkSubEntities(entities, segments) {
  var results = [];

  if (!Array.isArray(entities)) {
    var err = error(ERRORS.SUB_ENTITIES_NOT_ARRAY, segments, entities);
    results.push(err);
    return results;
  }

  entities.forEach(function(e, i) {
    var segs = segments.concat([i]);
    if (!e.hasOwnProperty('rel')) {
      var err = error(ERRORS.SUB_ENTITY_MISSING_REL, segs, e);
      results.push(err);
    } else {
      var rel = e.rel;
      var s = segs.concat(['rel']);


      if (!Array.isArray(rel)) {
        var err = error(ERRORS.SUB_ENTITY_RELS_NOT_ARRAY, s, rel);
        results.push(err);
      } else {
        if (rel.length === 0) {
          var err = error(ERRORS.SUB_ENTITY_REL_IS_EMPTY, s, rel);
          results.push(err);
          return;
        }

        rel.forEach(function(r, j) {
          if (typeof r !== 'string') {
            var err = error(ERRORS.SUB_ENTITY_REL_NOT_STRING, s.concat([j]), r);
            results.push(err);
          }
        });
      }
    }

    results = results.concat(checkEntity(e, segs));
  });

  return results;
};

function checkActions(actions, segments) {
  var results = []

  if (!Array.isArray(actions)) {
    var err = error(ERRORS.ACTIONS_NOT_ARRAY, segments, actions);
    results.push(err);
    return results;
  }

  actions.forEach(function(a, i) {
    var segs = segments.concat([i]);

    if (!a.hasOwnProperty('name')) {
      var err = error(ERRORS.ACTION_MISSING_NAME,
          segs, a);
      results.push(err);
    } else if (a.name !== null && typeof a.name !== 'string') {
      var err = error(ERRORS.ACTION_NAME_NOT_STRING,
          segs.concat(['name']), a.name);
      results.push(err);
    }

    if (a.hasOwnProperty('class')) {
      results = results.concat(checkClass(a.class, segs.concat(['class'])));
    }

    if (a.hasOwnProperty('method') && a.method !== null
        && typeof a.method !== 'string') {
      var err = error(ERRORS.ACTION_METHOD_NOT_STRING,
          segs.concat(['method']), a.method);
      results.push(err);
    }

    if (!a.hasOwnProperty('href')) {
      var err = error(ERRORS.ACTION_MISSING_HREF,
          segs, a);
      results.push(err);
    } else if (a.href !== null && typeof a.href !== 'string') {
      var err = error(ERRORS.ACTION_HREF_NOT_STRING,
          segs.concat(['href']), a.href);
      results.push(err);
    }

    if (a.hasOwnProperty('title') && a.title !== null
        && typeof a.title !== 'string') {
      var s = segs.concat(['title']);
      var err = error(ERRORS.ACTION_TITLE_NOT_STRING, s, a.title);
      results.push(err);
    }

    if (a.hasOwnProperty('type') && a.type !== null
        && typeof a.type !== 'string') {
      var s = segs.concat(['type']);
      var err = error(ERRORS.ACTION_TYPE_NOT_STRING, s, a.type);
      results.push(err);
    }

    if (a.hasOwnProperty('fields') && a.fields !== null) {
      results = results.concat(checkFields(a.fields, segs.concat(['fields'])));
    }
  });

  return results;
}

function checkFields(fields, segments) {
  var results = [];
  if (fields !== null && !Array.isArray(fields)) {
    var err = error(ERRORS.ACTION_FIELDS_NOT_ARRAY, segments, fields);
    results.push(err);
    return results;
  }

  fields.forEach(function(f, i) {
    var segs = segments.concat([i]);

    if (!f.hasOwnProperty('name')) {
      var err = error(ERRORS.ACTION_FIELD_MISSING_NAME,
          segs, f);
      results.push(err);
    } else if (f.name !== null && typeof f.name !== 'string') {
      var err = error(ERRORS.ACTION_FIELD_NAME_NOT_STRING,
          segs.concat(['name']), f.name);
      results.push(err);
    }

    if (f.hasOwnProperty('class')) {
      results = results.concat(checkClass(f.class, segs.concat(['class'])));
    }

    if (f.hasOwnProperty('title') && f.title !== null
        && typeof f.title !== 'string') {
      var s = segs.concat(['title']);
      var err = error(ERRORS.ACTION_FIELD_TITLE_NOT_STRING, s, f.title);
      results.push(err);
    }

    if (f.hasOwnProperty('type') && f.type !== null) {
      var s = segs.concat(['type']);
      if (typeof f.type !== 'string') {
        var err = error(ERRORS.ACTION_FIELD_TYPE_NOT_STRING, s, f.type);
        results.push(err);
        return;
      }

      if (FIELD_TYPES.indexOf(f.type) === -1) {
        var warning = warn(WARNINGS.UNKNOWN_FIELD, s, f.type);
        results.push(warning);
      }
    }

    // Future: Validate field values?  The Siren specification
    // currently leaves field values intentionally unspecified.
  });

  return results; 
}

function checkLinks(links, segments) {
  var results = [];

  if (!Array.isArray(links)) {
    var err = error(ERRORS.LINKS_NOT_ARRAY, segments, links);
    results.push(err);
    return results;
  }

  links.forEach(function(l, i) {
    var segs = segments.concat([i]);

    if (l.hasOwnProperty('class')) {
      results = results.concat(checkClass(l.class, segs.concat(['class'])));
    }

    if (!l.hasOwnProperty('rel')) {
      var err = error(ERRORS.LINK_MISSING_REL, segs, l);
      results.push(err);
    } else {
      var rel = l.rel;
      var s = segs.concat(['rel']);

      if (!Array.isArray(rel)) {
        var err = error(ERRORS.LINK_RELS_NOT_ARRAY, s, l);
        results.push(err);
      } else {
        if (rel.length === 0) {
          var err = error(ERRORS.LINK_REL_IS_EMPTY, s, rel);
          results.push(err);
          return;
        }

        rel.forEach(function(r, j) {
          if (typeof r !== 'string') {
            var err = error(ERRORS.LINK_REL_NOT_STRING, s.concat([j]), r);
            results.push(err);
          }
        });
      }
    }

    if (!l.hasOwnProperty('href')) {
      var err = error(ERRORS.LINK_MISSING_HREF, segs, l);
      results.push(err);
    } else if (typeof l.href !== 'string') {
      var err = error(ERRORS.LINK_HREF_NOT_STRING, segs.concat(['href']), l.href);
      results.push(err);
    }

    if (l.hasOwnProperty('title') && l.title !== null
        && typeof l.title !== 'string') {
      var s = segs.concat(['title']);
      var err = error(ERRORS.LINK_TITLE_NOT_STRING, s, l.title);
      results.push(err);
    }

    if (l.hasOwnProperty('type') && l.type !== null
        && typeof l.title !== 'string') {
      var s = segs.concat(['type']);
      var err = error(ERRORS.LINK_TYPE_NOT_STRING, s, l.type);
      results.push(err);
    }
  });

  return results;
}

validate.ValidationError = ValidationError;
validate.ValidationWarning = ValidationWarning;
