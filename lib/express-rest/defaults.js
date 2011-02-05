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
    ['GET',     '/$',               'fetchAll'],

    ['GET',     '/$',               'itemList',         'index'],
    ['POST',    '/$',               'itemCreate'],
    ['GET',     '/{new}',           'itemCreateForm',   'create_new'],


    ['GET',     '/:{key}/:op?',     'fetchItem'],

    ['GET',     '/:{key}',          'itemDetail',       'detail'],
    ['PUT',     '/:{key}',          'itemUpdate'],
    ['GET',     '/:{key}/{edit}',   'itemUpdateForm',   'detail_edit'],
    ['DEL',     '/:{key}',          'itemRemove']
];

// ------------------------------------------------------------------------

/** */
defaults.configure = function(target, config) {
    config = config || {};

    // middleware gets appended:
    target.middleware = [].concat(defaults.middleware).concat(config.middleware || []);

    // routes/formats are all-or-nothing overrides:
    target.routes = util.clone(config.routes || defaults.routes);
    target.formats = util.clone(config.formats || defaults.formats);

    // templates are mixed in, retaining defaults that aren't overridden:
    target.templates = util.mixin({}, defaults.templates, config.templates);
};

// ------------------------------------------------------------------------
