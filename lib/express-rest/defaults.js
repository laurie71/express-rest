// COPYRIGHT

var util = require('./util');

exports.middleware = [];

exports.handlers = {
    'index':        'index',
    'create':       'create',
    'detail':       'detail',
    'update':       'update',
    'remove':       'remove',
    'create_new':   'create_new',
    'detail_edit':  'detail_edit'
};

exports.templates = {
    'layout':       undefined,      // use Express default layout
    'prefix':       undefined,      // look for templates in <app>/views/...
    'index':        'index',        // -> <app>/views/prefix/index.ejs'
    'detail':       'detail',       // -> <app>/views/prefix/detail.ejs'
    'create_new':   'create_new',
    'detail_edit':  'detail_edit',  // -> <app>/views/prefix/detail_edit.ejs'
//  'create': null,
//  'update': null,
};

exports.formats = ['html', 'json', 'xml'];

exports.configure = function(target, config) {
    config = config || {};
    target.middleware = [].concat(exports.middleware).concat(config.middleware || []);
    target.handlers = util.mixin({}, exports.handlers, config.handlers);
    target.templates = util.mixin({}, exports.templates, config.templates);
    target.formats = util.clone(config.formats || exports.formats);
};
