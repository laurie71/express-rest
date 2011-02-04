// COPYRIGHT

var util = require('./util');

exports.middleware = [];

// todo: remove
//exports.handlers = {
//    'index':        'index',
//    'create':       'create',
//    'detail':       'detail',
//    'update':       'update',
//    'remove':       'remove',
//    'create_new':   'create_new',
//    'detail_edit':  'detail_edit'
//};

exports.routes = [
    ['GET',     '/$',                       'fetchAll'],

    ['GET',     '/$',                       'itemList'],
    ['POST',    '/$',                       'itemCreate'],
    ['GET',     '/{new}',                   'itemCreateForm'],


    ['GET',     '/:{key}/:op?',             'fetchItem'],

    ['GET',     '/:{key}',                  'itemDetail'],
    ['PUT',     '/:{key}',                  'itemUpdate'],
    ['GET',     '/:{key}/{edit}',           'itemUpdateForm'],
    ['DELETE',  '/:{key}',                  'itemRemove']
];

exports.templates = {
    'layout':           undefined,      // use Express default layout
    'prefix':           undefined,      // look for templates in <app>/views/...

    'itemList':         'index',        // -> <app>/views/prefix/index.ejs'
    'itemDetail':       'detail',       // -> <app>/views/prefix/detail.ejs'
    'itemCreateForm':   'create_new',
    'itemUpdateForm':   'detail_edit',  // -> <app>/views/prefix/detail_edit.ejs'
//  'create': null,
//  'update': null,
};

exports.formats = ['html', 'json', 'xml'];

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
