// COPYRIGHT

var sys = require('sys');
var path = require('path');
var defaults = require('./defaults');
var mime = require('./mime');
var util = require('./util');

var Route = require('./router').Route;
var Router = require('./router').Router;

// ------------------------------------------------------------------------

exports.Resource = Resource;

// ------------------------------------------------------------------------

/**
 * TODO CTOR DOCS
 *
 * @param {Object} config (optional)
 *      Resource configuration options as listed below. See the main
 *      {@link Resource} documentation for further details.
 * @param {String} config.routeKey  (optional; default: 'id')
 *      TODO DOCS
 * @param {String} config.routeNew  (optional; default: 'new')
 *      TODO DOCS
 * @param {String} config.routeEdit (optional; default: 'edit')
 *      TODO DOCS
 * @param {String} config.routeFormat (optional; default: 'format')
 *      TODO DOCS
 *
 * @constructs
 * @class
 *
 * Base class for RESTful resources.
 */
function Resource(config) {
    this.config = config || {};

    var cfg = util.clone(this.config);
    defaults.configure(cfg);
    util.mixin(this, cfg);

    this.initRoutes();
};

util.mixin(Resource.prototype, /** @lends Resource# */{
    /**
     * This resource's configuration options, routes, middleware and
     * supported content types.
     */
    config: null,

    prefix: null,

    /**
     * <p>
     * Called by the constructor to initialize the resource's routes,
     * converting them to instances of {@link Route}. Sub-classes
     * may override this method to supply custom route setup logic.
     * </p><p>
     * The default implementation iterates through the <code>this.routes</code>
     * array and for each entry <code>route</code> that isn't an instance
     * of {@link Route}, replaces it with the result of
     * <code>new Route(this, route)</code>.
     * </p>
     *
     * @param {Array} routes An array of route descriptions, in the
     *      format described in <a href="#config">Configuration</a>.
     */
    initRoutes: function() {
        var routes = this.routes;
        for (var i = 0, ilen = routes.length; i < ilen; i++) {
            if (! routes[i]) continue;
            if (! (routes[i] instanceof Route)) {
                var route = routes[i];
                routes[i] = new Route(this, routes[i]);
            }
        };
    },

    /**
     * Mount this resource on the given app at the specified URL
     * path.
     */
    mount: function(app, path, config) {
        new Router(path, this, config).mountAll(app);
    },

    // ********************
    // Content Negotiation support
    // ********************

    getRendererFor: function(mediaType) {
        var extension = mime.extension(mediaType),
            renderFn = 'render';

            sys.debug('getRendererFor(): '+mediaType+' -> '+extension);

        if (extension[0] == '.') {
            extension = extension.slice(1);
        }

        renderFn += extension[0].toUpperCase();
        renderFn += extension.slice(1).toLowerCase();

        return (typeof(this[renderFn]) === 'function')
            ? this[renderFn]
            : null;
    },

    renderHtml: function(req, res, next, data, resource, route, router) {
        var template = route.template;

        if (! template) {
            // nothing to render; just forward to next in chain
            next();
            return;
        }

        var prefix = router.config.prefix || resource.prefix;
        if (prefix) template = path.join(prefix, template);

        var args = { locals: data };
        var layout = router.config.layout || resource.config.layout;
        if (layout != undefined) args.layout = layout;

        util.log.debug('xRest.Router: HTML: rendering: '+template);
        res.render(template, args);
    },

    renderJson: function(req, res, next, data) {
sys.debug('SEND JSON: '+JSON.stringify(data));
        res.send(JSON.stringify(data || {}) + '\n');
    },

    renderJs: function(req, res, data) {
        var fn = req.param('???'); // xxx
        res.send('function '+fn+'() {'+
            JSON.stringify(data || {}) // ???
        +'}');
    },

    renderTxt: function(req, res, next, data) {
        data = data || {};
        if (data.hasOwnProperty('toString')) {
            data = data.toString();
        } else {
            data = JSON.stringify(data);
        }
        res.send(data);
    },

    // ********************

    toString: function() {
        var type = __proto__.constructor.name || 'resource';
        return '['+type+' Resource]';
    }
});
