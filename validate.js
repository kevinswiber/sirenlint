var ERRORS = require('./errors');

function ValidationError(message, segments, value) {
  if (!(this instanceof ValidationError)) {
    return new ValidationError(message, segments);
  }

  this.message = message;
  this.segments = segments;
  this.value = value;
}

function ValidationWarning(message, segments, value) {
  if (!(this instanceof ValidationError)) {
    return new ValidationError(message, segments);
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

module.exports = function validate(subject) {
  var errors = [];
  var result = subject;
  var segments = [];

  try {
    result = JSON.parse(subject);
  } catch(err) {
    errors.push(error(ERRORS.INVALID_JSON, segments, subject));
    return errors;
  }

  errors = errors.concat(checkEntity(result, segments.concat([])));

  return errors;
}

function checkEntity(result, segments) {
  var errors = [];

  if (result.hasOwnProperty('class')) {
    errors = errors.concat(checkClass(result.class,
          segments.concat(['class'])));
  }

  if (result.hasOwnProperty('properties')) {
    errors = errors.concat(checkProperties(result.properties,
          segments.concat(['properties'])));
  }

  if (result.hasOwnProperty('entities')) {
    errors = errors.concat(checkSubEntities(result.entities,
          segments.concat(['entities'])));
  }

  if (result.hasOwnProperty('links')) {
    errors = errors.concat(checkLinks(result.links,
          segments.concat(['links'])));
  }

  return errors;
}

function checkClass(cls, segments) {
  var errors = [];

  if (!Array.isArray(cls)) {
    errors.push(error(ERRORS.CLASSES_NOT_ARRAY, segments, cls));
    return errors;
  }

  cls.forEach(function(c, i) {
    if (typeof c !== 'string') {
      var err = error(ERRORS.CLASS_NOT_STRING, segments.concat([i]), c);
      errors.push(err);
    }
  });

  return errors;
}

function checkProperties(properties, segments) {
  var errors = [];

  if (typeof properties !== 'object' || Array.isArray(properties)) {
    var err = error(ERRORS.PROPERTIES_NOT_OBJECT, segments, properties);
    errors.push(err);
  }

  return errors;
}

function checkSubEntities(entities, segments) {
  var errors = [];

  if (!Array.isArray(entities)) {
    var err = error(ERRORS.SUB_ENTITIES_NOT_ARRAY, segments, entities);
    errors.push(err);
    return errors;
  }

  entities.forEach(function(e, i) {
    var segs = segments.concat([i]);
    if (!e.hasOwnProperty('rel')) {
      var err = error(ERRORS.SUB_ENTITY_MISSING_REL, segs, e);
      errors.push(err);
    }

    errors = errors.concat(checkEntity(e, segs));
  });

  return errors;
};

function checkLinks(links, segments) {
  var errors = [];

  if (!Array.isArray(links)) {
    var err = error(ERRORS.LINKS_NOT_ARRAY, segments, links);
    errors.push(err);
    return errors;
  }

  links.forEach(function(l, i) {
    var segs = segments.concat([i]);

    if (l.hasOwnProperty('class')) {
      errors = errors.concat(checkClass(l.class, segs.concat(['class'])));
    }

    if (!l.hasOwnProperty('rel')) {
      var err = error(ERRORS.LINK_MISSING_REL, segs, l);
      errors.push(err);
    } else {
      var rel = l.rel;
      segs.push('rel');

      if (!Array.isArray(rel)) {
        var err = error(ERRORS.LINK_RELS_NOT_ARRAY, segs, l);
        errors.push(err);
      }

      rel.forEach(function(r, j) {
        if (typeof r !== 'string') {
          var err = error(ERRORS.LINK_REL_NOT_STRING, segs.concat([j]), r);
          errors.push(err);
        }
      });

      segs.pop();
    }

    if (!l.hasOwnProperty('href')) {
      var err = error(ERRORS.LINK_MISSING_HREF, segs, l);
      errors.push(err);
    } else if (typeof l.href !== 'string') {
      var err = error(ERRORS.LINK_HREF_NOT_STRING, segs.concat(['href']), l);
      errors.push(err);
    }

    if (l.hasOwnProperty('title') && typeof l.title !== 'string') {
      var s = segs.concat(['title']);
      var err = error(ERRORS.LINK_TITLE_NOT_STRING, s, l);
      errors.push(err);
    }
  });

  return errors;
}
