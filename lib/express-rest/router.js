// COPYRIGHT

var express = require('express');
var mime = require('./mime');
var path = require('path');
var sys = require('sys');

var defaults = require('./defaults');
var util = require('./util');

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
            resource = this.resource,
            template = route.template || resource.template;

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
            // pre-populate context
            req.context.locals = req.context.locals || {};
            req.context.xrest = {
                route:    route,
                resource: resource,
                template: template,
                //prefix: this.config.prefix || resource.config.prefix
                prefix: self.config.prefix || resource.config.prefix
            };

            // proxy res.render to default template and options
            var render = res.render;
            res.render = _render;
            function _render(template, options) {
                var args = Array.prototype.slice.call(arguments, 0),
                    ctx = req.context;

                ctx.xrest.template = (arguments.length == 0)
                    ? ctx.xrest.template || false
                    : template;

                if (arguments.length > 1) {
                    ctx.xrest.templateOpts = options;
                }

                _next(); // call proxied next
            }

            // proxy next to render this route's template if
            // it has one, otherwise forward down the stack
            function _next(err) {
                res.render = render; // restore original
                if (err) return next(err);
                self.routeResponse(req, res, next);
            }

            util.log.debug('router: call handler: '+route.handlerName+'()');
            route.handler.call(resource, req, res, _next);
        };

        var middleware = resource.middleware || this.middleware || [];
        app[route.method.toLowerCase()](path, middleware, fn);
    },

    // --------------------
    // Content Negotiation
    // --------------------

    selectFormat: function(req, resource) {
        var c = this.config,
            r = this.resource,
            rc = r.config,
            dc = defaults,
            formatKey = c['routeFormat'] || rc['routeFormat'] || 'format',
            supportedFormats = c.formats || rc.formats || dc.formats || [],
            formatName;

        // :.{formatKey} or ?{formatKey}= take priority:
        var formatName = req.param(formatKey);
util.log.debug('*** req.format: '+formatName);
util.log.debug('*** req.Accept: '+req.header('Accept'));
util.log.debug('*** supported: '+JSON.stringify(supportedFormats));

        if (formatName) {
            format = mime.type('.'+formatName)
        }

        // if there was no format specifier in the URL
        // path/query, look at the request Accepts header
        if (! formatName) {
            var accepts = new mime.MediaAccept(req.header('Accept'))
                .match(supportedFormats);
util.log.debug('*** accepted: '+accepts.map(function(type) {
    return type.media.toString() + ' (Q:'+ type.range.quality+')'
}));
            format = accepts ? accepts[0].media.toString() : null;
        }

        // todo send 406 response if no suitable format
util.log.debug(' --> '+format);
        return format;
    },

    // --------------------

//    renderResponse: function(req, res, next, data, resource, route) {
//        if (!route.template && !resource.template) return next();
//
//            req.format = this.selectFormat(req, resource);
//
//        var format = req.format,
////            mimeType = mime.type(format); // XXX
//            mimeType = format.toString(), // XXX
//            renderFn = resource.getRendererFor(mimeType);
//
//util.log.debug('renderResponse(): fn is '+renderFn.name);
//util.log.debug('renderResponse(): fn is '+typeof(renderFn));
////util.log.debug('renderResponse(): fn is '+renderFn);
//
//        res.header('Content-Type', mimeType);
//        renderFn(req, res, next, data, resource, route, this);
//
////        if (mimeType.indexOf('html') >= 0) {
////            this.renderHtmlResponse(req, res, next, data, resource, route);
////            return;
////        }
////        if (mimeType.indexOf('json') >= 0) {
////            this.renderJsonResponse(req, res, next, data, resource, route);
////            return;
////        }
//    },

    routeResponse: function(req, res, next) {
        var context = req.context,
            template = context.xrest.template,
            resource = context.xrest.resource,
//            toptions = (context.xrest.templateOpts || context),
            mimeType, renderFn, layout, args;

        if (! template) { // TODO: if template === undefined next() else return html/json/txt/etc
            // nothing to render; just forward to next in chain
            next();
            return;
        }

//        args = { locals: toptions };
//        layout = this.config.layout || resource.config.layout; // fixme: remove support for this; if you want to set a layout, set it in the request context
//        if (layout != undefined) args.layout = layout;

        mimeType = this.selectFormat(req, resource);
        renderFn = resource.getRendererFor(mimeType);

        res.header('Content-Type', mimeType);
        renderFn(req, res, next);
    }
});
