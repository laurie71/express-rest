// COPYRIGHT

var express = require('express');
var defaults = require('./defaults');
var util = require('./util');
var path = require('path');
var sys = require('sys');

var methods = require('connect').router.methods.concat(['del', 'all']);

// ------------------------------------------------------------------------

exports.Router = Router;
exports.Route = Route;

// ------------------------------------------------------------------------

/**
 * Constructs a route descriptor from the given specification. A route
  descriptor can be specified in either <code>Object</code>- or
  <code>Array</code>-form. In {Object}-form it consists of an object with
   the following properties:

 * <dl>
 *     <dt><t>{String}</t>method</dt>
 *     <dd>TODO DOCS</dd>
 *     <dt><t>{String}</t>(optional) path</dt>
 *     <dd>TODO DOCS</dd>
 *     <dt><t>{String|Function}</t>handler</dt>
 *     <dd>TODO DOCS</dd>
 *     <dt><t>{String}</t>(optional) template</dt>
 *     <dd>TODO DOCS</dd>
 * </dl>

 * The {Array}-form is an array of values in the same order as listed above.

 * The following calls would be equivalent:

 * <code>new Route({ method: 'get', path: '/

 * @param {String} method
 * @param {String} path
 * @param {String} template
 * @param {String|Function} handler (optional)
 *
 * @constructs
 * @class
 *
 * A route descriptor for a {@link Resource}, specifying how the resource
 * will process requests matching the route. A <code>Route</code> comprises:
 * <ul>
 * <li>the HTTP method(s) the route responds to</li>
 * <li>the URL path(s) the route matches</li>
 * <li>the route handler function to call on the resource when the route is matched</li>
 * <li>the template to render when responding with HTML</li>
 * </ul>
 */
function Route(resource, desc) {
    if (Array.isArray(desc)) {
        desc = {
            method:     desc[0],
            path:       desc[1],
            handler:    desc[2],
            template:   desc[3]
        };
    } else {
        if (! desc.method)  throw new Error("route descriptor missing 'method'");
        if (! desc.path)    throw new Error("route descriptor missing 'path'");
        if (! desc.handler) throw new Error("route descriptor missing 'handler'");
    }

    this.resource = resource;
    this.template = desc.template;

    this.initMethod(desc.method);
    this.initPath(desc.path);
    this.initHandler(desc.handler);

    Object.freeze(this);
};

util.mixin(Route.prototype, /** @lends Route# */{
    initMethod: function(method) {
        if (! method) {
            method = 'all';
        } else {
            if (typeof(method) !== 'string') {
                throw new Error('invalid method (not a string) in route: '+this);
            }

            var m = method.toLowerCase();
            if (m === '*' || m === 'any') {
                m = 'all';
            } else if (methods.indexOf(m) < 0) {
                throw new Error('invalid method "'+method+'" in route: '+this);
            }
            method = m;
        }

        this.method = method;
    },

    initPath: function(path) {
        if (! path) {
            path = '/';
        } else if (path[0] !== '/') {
            path = '/' + path;
        }

        this.path = path;
    },

    initHandler: function(fn) {
        var fnn;
        if (typeof(fn) === 'string') {
            fnn = fn;
            fn = this.resource[fn];

            if (! fn) {
                fn = this.defaultHandler;
            } else {
                if (typeof(fn) !== 'function') {
                    throw new Error('resource has no function "'+fnn+'" in route: '+this);
                }
            }
        } else if (typeof(fn) !== 'function') {
            throw new Error('invalid handler (not a function) in route: '+this);
        } else {
            fnn = fn.name;
        }

        this.handler = fn;
        this.handlerName = fnn;
    },

    defaultHandler: function(req, res, next) { next(); },

    toString: function() {
        return util.template(
            '[Route: {method} {path} -> {handlerName}() on {resource}]',
            this);
    }
});

// ------------------------------------------------------------------------

/**
 * @constructs
 * @class
 */
function Router(mount, resource, config) {
    this.config = config || {};
    this.mount = mount || '/';
    this.resource = resource;

    if (! (resource instanceof require('./resource').Resource)) {
        throw new Error('not a resource: '+resource);
    }

    var cfg = util.clone(this.config);
    defaults.configure(cfg);
    //util.mixin(this, cfg)
    this.config = cfg; // todo: apply config instead of overwriting

    this.routes = [];
//    this.addRoutes(this.config.routes);
    this.addRoutes(resource.routes);
};

util.mixin(Router.prototype, /** @lends Router# */{
    addRoutes: function(routes) {
        for (var i = 0, ilen = routes.length; i < ilen; i++) {
            var route = routes[i];
            if (! route) continue;
            if (! (route instanceof Route)) {
                route = new Route(this.resource, route);
            }
            this.routes.push(route);
        };
    },

    mountAll: function(app) {
        var routes = this.routes;
        for (var i = 0, ilen = routes.length; i < ilen; i++) {
            this._mountRoute(app, routes[i]);
        }
    },

    _mountRoute: function(app, route) {
        var self = this,
            mount = this.mount,
            path = route.path || '',
            resource = this.resource;

        // process the path
        if (mount[mount.length - 1] === '/') {
            mount = mount.slice(0, -1);
        }
        path = mount + path;

        path = util.template(path, {
            'key': resource.config.routeKey || 'id',
            'new': resource.config.routeNew || 'new',
            'edit': resource.config.routeEdit || 'edit',
            'format': resource.config.routeFormat || 'format'
        });

        var fn = function routeRequest(req, res, next) {
            req.format = self.selectFormat(req, resource); // todo: content negotiation support
util.log.debug('router: call handler: '+route.handlerName+'()');
            route.handler.call(resource, req, res, function routeResponse(err) {
                if (err) return next(err);
util.log.debug('router: render response with context: '+JSON.stringify(req.context));
                self.renderResponse(req, res, next, resource, route);
            });
        };

        var middleware = resource.middleware || this.middleware || [];
        app[route.method.toLowerCase()](path, middleware, fn);
        util.log.debug('xrest.Router: mount: '+path+' '+route);
    },

    selectFormat: function(req, resource) {
        // todo: content negotiation
        return 'html';
    },

    renderResponse: function(req, res, next, resource, route) {
        var template = route.template;

        if (! template) {
            // nothing to render; just forward to next in chain
            next();
            return;
        }

        var prefix = this.config.prefix || resource.prefix;
        if (prefix) template = path.join(prefix, template);

        var args = { locals: req.context };
        var layout = this.config.layout || resource.config.layout; // fixme: remove support for this; if you want to set a layout, set it in the request context
        if (layout != undefined) args.layout = layout;

        util.log.debug('xRest.Router: HTML: rendering: '+template);
        res.render(template, args);

        next();
    }
});

