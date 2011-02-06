// COPYRIGHT

var sys = require('sys');
var defaults = require('./defaults');
var util = require('./util');

var Route = require('./router').Route;
var Router = require('./router').Router;

// ------------------------------------------------------------------------

exports.Resource = Resource;

// ------------------------------------------------------------------------

/**
 * @param {Object} config (optional) Resource configuration. See the
 *      {@link Resource} documentation for details of supported options.
 * @param {Object} config.routeKey (optional) blah blah
 *
 * @constructs
 * @class
 *
 * Base class for RESTful resources.
 *
 * <p>
 * <h2><a id="config">Configuration</a></h2>
 * <t>Resource</t> accepts the following options in its <code>config</code>
 * parameter, all optional:
 *
 * <dl><dt><t>{String}</t> routeKey</dt>
 *     <dd>TODO DOCS</dd>
 *     <dt><t>{String}</t> routeNew</dt>
 *     <dd>TODO DOCS</dd>
 *     <dt><t>{String}</t> routeEdit</dt>
 *     <dd>TODO DOCS</dd>
 * </ul>
 * </p>
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

    toString: function() {
        var type = __proto__.constructor.name || 'resource';
        return '['+type+' Resource]';
    }
});
