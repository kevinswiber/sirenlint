'use strict';

const ERRORS = {
  INVALID_JSON: 'Invalid JSON',
  CLASSES_NOT_ARRAY: 'The `class` attribute is not an array',
  CLASS_NOT_STRING: 'Class is not a string',
  PROPERTIES_NOT_OBJECT: 'The `properties` attribute is not an object',
  SUB_ENTITIES_NOT_ARRAY: 'The `entities` attribute is not an array',
  SUB_ENTITY_MISSING_REL: 'Sub-entity is missing `rel` attribute',
  LINKS_NOT_ARRAY: 'The `links` attribute is not an array',
  LINK_MISSING_REL: 'Link is missing `rel` attribute',
  LINK_RELS_NOT_ARRAY: 'Link `rel` attribute is not an array',
  LINK_REL_NOT_STRING: 'Link relation is not a string',
  LINK_MISSING_HREF: 'Link is missing `href` attribute',
  LINK_HREF_NOT_STRING: 'Link `href` attribute is not a string',
  LINK_TITLE_NOT_STRING: 'Link `title` attribute is not a string',
  LINK_TYPE_NOT_STRING: 'Link `type` attribute is not a string',
  TITLE_TYPE_NOT_STRING: 'The `title` attribute is not a string'
};

module.exports = ERRORS;
