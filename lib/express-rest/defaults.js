// COPYRIGHT

var util = require('./util');

// ------------------------------------------------------------------------

exports.middleware = [];

exports.formats = ['html', 'json', 'xml'];

exports.routes = [
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

exports.configure = function(target, config) {
    config = config || {};

    // middleware gets appended:
    target.middleware = [].concat(exports.middleware).concat(config.middleware || []);

    // routes/formats are all-or-nothing overrides:
    target.routes = util.clone(config.routes || exports.routes);
    target.formats = util.clone(config.formats || exports.formats);

    // templates are mixed in, retaining defaults that aren't overridden:
    target.templates = util.mixin({}, exports.templates, config.templates);
};

// ------------------------------------------------------------------------
