// COPYRIGHT

var express = require('express');
var defaults = require('./defaults');
var util = require('./util');
var path = require('path');
var sys = require('sys');

var methods = require('connect').router.methods.concat(['del', 'all']);
var Resource = require('./resource').Resource;

function Router(app, mount, resource, config) {
    this.app = app;
    this.mount = mount;
    this.resource = resource;
    this.config = config || {};

//    if (! (app instanceof express.Server)) throw new Error('app must be an express.Server: '+app); // xxx why doesn't this work?
    if (! mount) throw new Error('no mount specified');
    if (! (resource instanceof Resource)) throw new Error('not a resource: '+resource);

    defaults.configure(this, config);

    this._initRoutes();
};

util.mixin(Router.prototype, {
    _initRoutes: function() {
        var self = this,
            app = this.app,

            resource = this.resource,
            routes = resource.routes || this.routes,
            key = resource.config.routeKey || 'id',
            opNew = resource.config.routeNew || 'new',
            opEdit = resource.config.routeEdit || 'edit',
            format = resource.config.routeFormat || 'format',

            mount = this.mount,
//            mountId = mount + '/:'+key,
//            mountNew = mount + '/'+opNew,
//            mountEdit = mountId + '/'+opEdit,

            middleware = this.middleware;

        for (var i = 0, ilen = routes.length; i < ilen; i++) {
            var route = routes[i];
            if (! route) continue;

            var method = route[0],
                path = route[1],
                fn = route[2],
                fnn;

            // normalize and verify route description
            var routeStr = JSON.stringify(route);

            if (! method) {
                method = 'all';
            } else {
                if (typeof(method) !== 'string') {
                    throw new Error('invalid method (not a string) in route: '+routeSrt)
                }

                var m = method.toLowerCase();
                if (m === '*' || m === 'any') {
                    m = 'all';
                } else if (methods.indexOf(m) < 0) {
                    throw new Error('invalid method "'+method+'" in route: '+routeStr);
                }
                method = m;
            }

            if (typeof(fn) === 'string') {
                fnn = fn;
                fn = resource[fn];
                if (fn) {
                    if (typeof(fn) !== 'function') {
                        throw new Error('resource has no function "'+fnn+'" in route: '+routeStr);
                    }
                } else {
                    fn = function(req, res, next) { next(); }
                }
            } else if (typeof(fn) !== 'function') {
                throw new Error('invalid handler (not a function) in route: '+routeStr);
            } else {
                fnn = fn.name;
            }


            // process the path
            path = path || '';
            var mountSlash = (mount[mount.length - 1] === '/');
            var pathSlash = (path && path[0] === '/');
            if (mountSlash && pathSlash) {
                path = path.slice(1);
            } else if (! (mountSlash || pathSlash)) {
                path = '/' + path;
            }
            path = mount + path;

            path = util.template(path, {
                'key': key,
                'new': opNew,
                'edit': opEdit,
                'format': format
            });

            // register the route
            fn = self.createRouteHandler(fn, fnn, resource);
            app[method](path, middleware, fn);

            util.log.debug('xrest.Router: added route: ['
                + method + ' ' + path + ' -> ' + fnn + ']');
        };
    },

    createRouteHandler: function(fn, fnn, resource) {
        var self = this;

        return function routeRequest(req, res, next) {
util.log.debug('router: call handler: '+fnn+'()');
            req.format = self.selectFormat(req, resource);
            fn.call(resource, req, res, function routeResponse(data) {
                self.renderResponse(req, res, next, data, resource, fnn);
            });
        };
    },

    selectFormat: function(req, resource) {
        // todo: content negotiation
        return 'html';
    },

    renderResponse: function(req, res, next, data, resource, handler) { // todo: better way to lookup template
        var template = resource.templates[handler]
                    || this.templates[handler]
                    || defaults.templates[handler];

        if (! template) {
            // nothing to render; just forward to next in chain
            next();
            return;
        }

        var layout = resource.templates.layout
                  || this.templates.layout
                  || defaults.templates.layout;

        var prefix = resource.templates.prefix
                  || this.templates.prefix
                  || defaults.templates.prefix;

        if (prefix) {
            template = path.join(prefix, template);
        }

        var args = { locals: data };
        if (layout != undefined) {
            args.layout = layout;
        }

        util.log.debug('xRest.Router: HTML: rendering: '+template);
        res.render(template, args);

        next();
    }
});

exports.Router = Router;
