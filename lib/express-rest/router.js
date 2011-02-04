// COPYRIGHT

var express = require('express');
var defaults = require('./defaults');
var util = require('./util');
var path = require('path');
var sys = require('sys');

var Resource = require('./resource').Resource;


function Router(app, mount, resource, config) {
    this.app = app;
    this.mount = mount;
    this.resource = resource;
    this.config = config || {};

//    if (! (app instanceof express.Server)) throw new Error('app must be an express.Server: '+app);
    if (! mount) throw new Error('no mount specified');
    if (! (resource instanceof Resource)) throw new Error('not a resource: '+resource);

    defaults.configure(this, config);
    this._initRoutes();
};

util.mixin(Router.prototype, {
    _initRoutes: function() {
        // todo: customization of routing (method, url pattern)

        var self = this,
            app = this.app,

            resource = this.resource,
            key = resource.config.routeKey || 'id',
            opNew = resource.config.routeNew || 'new',
            opEdit = resource.config.routeEdit || 'edit',

            mount = this.mount,
            mountId = mount + '/:'+key,
            mountNew = mount + '/'+opNew,
            mountEdit = mountId + '/'+opEdit,

            middleware = this.middleware;

//        middleware = middleware || [];

        util.log.debug('xrest.Router: SETUP: ['
            +([mount, mountId, mountNew, mountEdit]).join(', ')
            +']');

        for (var handler in this.handlers) {
            if (this.handlers.hasOwnProperty(handler)) {
                var h = this.createRouteHandler(handler, resource);

                switch (handler) {
                    case 'index':       app.get (mount+'.:format?/?$',     middleware, h); break;
                    case 'create':      app.post(mount+'.:format?/?$',     middleware, h); break;
                    case 'detail':      app.get (mountId+'.:format?/?$',   middleware, h); break;
                    case 'update':      app.put (mountId+'.:format?/?$',   middleware, h); break;
                    case 'remove':      app.del (mountId+'.:format?/?$',   middleware, h); break;
                    case 'create_new':  app.get (mountNew+'.:format?/?$',  middleware, h); break;
                    case 'detail_edit': app.get (mountEdit+'.:format?/?$', middleware, h); break;
                }
            }
        }
    },

    createRouteHandler: function(handler, resource) {
        var name = resource.handlers[handler];  // todo if == false/undefined
        var fn = resource[name];                // todo if == false/undefined
        var self = this;

        util.log.debug('xRes.Router: routing requests to '
            +handler+' handler '+name+'()'
            +' on '+resource
            );

        return function routeRequest(req, res, next) {
util.log.debug('router: call handler: '+handler);
            fn.call(resource, req, res, function routeResponse(data) {
util.log.debug('router: handler returned:\n'+sys.inspect(data));
                var format = self.selectFormat(req, resource, data);
                self.renderResponse(req, res, next, data, format, resource, handler);
            });
        };
    },

    selectFormat: function(req, resource, data) {
        // todo: content negotiation
        return 'html';
    },

    renderResponse: function(req, res, next, data, format, resource, handler) {
        var template = resource.templates[handler]
                    || this.templates[handler]
                    || defaults.templates[handler];

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
