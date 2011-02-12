// COPYRIGHT

var util = require('./util');

// ------------------------------------------------------------------------

/** @namespace */
var defaults = exports;

// ------------------------------------------------------------------------

/** */
defaults.middleware = [];

/** */
defaults.formats = ['html', 'json', 'xml'];

/** */
defaults.routes = [
    // default data query/manipulation routes:

    ['GET',     '/?.:format?',              'fetchAll'],
    ['POST',    '/?.:format?',              'createItem'],
    ['PUT',     '/:{key}.:format?',         'updateItem'],
    ['DEL',     '/:{key}.:format?',         'removeItem'],
    ['GET',     '/:{key}/:op?.:format?',    'fetchItem'],

    // default response producing routes:

    ['GET',     '/?.:format?',              'itemList',         'index'],
    ['GET',     '/:{key}.:format?',         'itemDetail',       'detail'],
    ['GET',     '/{new}',                   'itemCreateForm',   'create_new'],
    ['GET',     '/:{key}/{edit}',           'itemUpdateForm',   'detail_edit']
];

// ------------------------------------------------------------------------

/**
 * Apply xRest defaults to the given configuration, returning a new
 * configuration object. Defaults are combined with the passed
 * configuration as follows: [TODO DOCS (API subject to change)]
 *
 * @param {Object} config (optional) The configuration to merge with defaults.
 * @return {Object} A new, merged, configuration object.
 */
defaults.configure = function(config) {
    var cfg = config || {};

    // middleware gets appended:
    cfg.middleware = [].concat(defaults.middleware || []).concat(cfg.middleware || []);

    // routes/formats are all-or-nothing overrides:
    cfg.routes = util.clone(cfg.routes || defaults.routes);
    cfg.formats = util.clone(cfg.formats || defaults.formats);

    // templates are mixed in, retaining defaults that aren't overridden:
    cfg.templates = util.mixin({}, defaults.templates, cfg.templates);

    return cfg;
};

// ------------------------------------------------------------------------
