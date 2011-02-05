// COPYRIGHT

var express = require('express');
var defaults = require('./defaults');
var util = require('./util');
var path = require('path');
var sys = require('sys');

var methods = require('connect').router.methods.concat(['del', 'all']);
var Resource = require('./resource').Resource;

// ------------------------------------------------------------------------

exports.Router = Router;
exports.Route = Route;

// ------------------------------------------------------------------------

/**
 * TODO CTOR DOCS
 *
 * @param {String} method
 * @param {String} path
 * @param {String} template
 * @param {String|Function} handler (optional)
 *
 * @constructs
 * @class
 *
 * A route configuration describing how xRest should map a request
 * for a particular resource.
 */
function Route(resource, method, path, handler, template) {
    this.resource = resource;
    this.template = template;

    this.initMethod(method);
    this.initPath(path);
    this.initHandler(handler);

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
function Router(app, mount, resource, config) {
    this.app = app;
    this.resource = resource;
    this.mount = mount || '/';
    this.config = config || {};

    if (! (app instanceof express.Server)) throw new Error('app must be an express.Server: '+app);
    if (! (resource instanceof Resource)) throw new Error('not a resource: '+resource);

    defaults.configure(this, config);

    this._initRoutes();
};

util.mixin(Router.prototype, /** @lends Router# */{
    _initRoutes: function() {
        var resource = this.resource;
        var routes = resource.routes || this.routes;
        for (var i = 0, ilen = routes.length; i < ilen; i++) {
            var route = routes[i];
            if (! route) continue;

            if (! (route instanceof Route)) {
                route = new Route(resource, route[0], route[1], route[2], route[3]);
                this.routes[i] = route;
            }

            // register the route
            this.mountRoute(route);
        };
    },

    mountRoute: function(route) {
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
util.log.debug('router: call handler: '+route.handlerName+'()');
            req.format = self.selectFormat(req, resource); // todo: content negotiation support
            route.handler.call(resource, req, res, function routeResponse(data) {
                self.renderResponse(req, res, next, data, resource, route);
            });
        };

        var middleware = resource.middleware || this.middleware || [];
sys.debug('--- this.app['+route.method.toLowerCase()+']('+path+', middleware, fn -> '+route.handlerName);
        this.app[route.method.toLowerCase()](path, middleware, fn);
        util.log.debug('xrest.Router: mount: '+path+' '+route);
    },

    selectFormat: function(req, resource) {
        // todo: content negotiation
        return 'html';
    },

    renderResponse: function(req, res, next, data, resource, route) { // todo: better way to lookup template
        var template = route.template;

        if (! template) {
            // nothing to render; just forward to next in chain
            next();
            return;
        }

        var prefix = resource.config.prefix;
        if (prefix) template = path.join(prefix, template);

        var args = { locals: data };
        var layout = resource.config.layout;
        if (layout != undefined) args.layout = layout;

        util.log.debug('xRest.Router: HTML: rendering: '+template);
        res.render(template, args);

        next();
    }
});

