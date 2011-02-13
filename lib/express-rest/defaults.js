// COPYRIGHT

var util = require('./util');
var context = require('./middleware/context');

// ------------------------------------------------------------------------

/** @namespace */
var defaults = exports;

// ------------------------------------------------------------------------

/** */
defaults.middleware = [context()];

/** */
defaults.formats = [ 'json', 'html', 'text/xml' ];

/** */
defaults.routes = [
    ['GET',     '/?.:format?',              'fetchAll'],
    ['POST',    '/?.:format?',              'itemCreate'], // todo: rename createItem
    ['PUT',     '/:{key}.:format?',         'itemUpdate'], // todo: rename updateItem
    ['DEL',     '/:{key}.:format?',         'itemRemove'], // todo: rename removeItem
    ['GET',     '/:{key}/:op?.:format?',    'fetchItem'],

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
