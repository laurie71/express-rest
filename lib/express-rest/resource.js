// COPYRIGHT

var defaults = require('./defaults');
var util = require('./util');

// ------------------------------------------------------------------------

exports.Resource = Resource;

// ------------------------------------------------------------------------

/**
 * Base class for RESTful resources.
 *
 * <p><h1>Configuration</h1>
 * <t>Resource</t> accepts the following options in its <code>config</code>
 * parameter, all optional:
 * <ul>
 * <li>@param {String} routeKey
 * <li>@param {String} routeNew
 * <li>@param {String} routeEdit
 * </ul>
 * </p>
 *
 * @param {Object} config (optional)
 *      Route specific configuration options.
 */
function Resource(config) {
    this.config = config = config || {};
    defaults.configure(this, config);
};

util.mixin(Resource.prototype, {
// todo: remove
//    getRoutes: function() {
//        var key = this.config.routeKey || 'id',
//            opNew = this.config.routeNew || 'new',
//            opEdit = this.config.routeEdit || 'edit',
//            format = this.config.routeFormat || 'format';
//
//        var args = {
//            'key': key,
//            'new': opNew,
//            'edit': opEdit,
//            'format': format
//        };
//
//        function route(method, path, handler) {
//            path = util.template(path, args);
//            return { method: method, path: path, handler: handler };
//        };
//
//        return [
//            // data pre-fetches
//            ['GET',     '/$',                       'fetchAll'),
//            ['GET',     '/:{key}/:op?',             'fetchItem'),
//
//            // collection handling:
//            ['GET',     '/$',                       'itemList'),
//            ['POST',    '/$',                       'itemCreate'),
//
//            // item handling:
//            ['GET',     '/:{key}',                  'itemDetail'),
//            ['PUT',     '/:{key}',                  'itemUpdate'),
//            ['DELETE',  '/:{key}',                  'itemRemove'),
//
//            // forms: (todo: now we have pre-fetch, we shouldn't need these)
//            ['GET',     '/_{new}',                  'itemCreateForm'),
//            ['GET',     '/_{edit}',                 'itemUpdateForm')
//
//
//            // todo: figure out where to handle 'format'
//            // todo: figure out if we need pattern termination (/?$)
//            //['GET',     '/{edit}.:{format}?/?$',    'detail_edit')
//        ];
//    },
//
//    // ********************
//    // Default handlers:
//    // ********************
//
//    'index':        function(req, res, next) { next(); },
//    'create':       function(req, res, next) { next(); },
//    'detail':       function(req, res, next) { next(); },
//    'update':       function(req, res, next) { next(); },
//    'remove':       function(req, res, next) { next(); },
//    'create_new':   function(req, res, next) { next(); },
//    'detail_edit':  function(req, res, next) { next(); },

    toString: function() {
        var type = __proto__.constructor.name || resource;
        return '['+type+' Resource]';
    }
});

