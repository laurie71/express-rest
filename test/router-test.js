var express = require('express');
var assert = require('assert');
var vows = require('vows');
var sys = require('sys');

var xrest = require('../lib/express-rest'),
    Resource = xrest.Resource,
    Router = xrest.Router;

xrest.util.log.debug = function() {};

exports.suite = vows.describe('xRest Router').addBatch({
    'Router constructed without arguments': {
        topic: function() {
            var app = express.createServer();
            var resource = new Resource();
            return new Router('/', resource, {});
        },

        'has routes': function(router) { assert.isArray(router.routes); },
//        'matching default routes': function(router) { assert.deepEqual(router.routes, xrest.defaults.routes); },

        'has config.formats': function(router) { assert.isArray(router.config.formats); },
        'matching default formats': function(router) { assert.deepEqual(router.config.formats, xrest.defaults.formats); },

        'has config.middleware': function(router) { assert.isArray(router.config.middleware); },
        'matching default middleware': function(router) { assert.deepEqual(router.config.middleware, xrest.defaults.middleware); }
    },

    'Router constructed with arguments': {
        topic: function() {
            var resource = new Resource();
            return new Router('/', resource, {
                routes: [[ 'GET', '/', 'dummy']],
                middleware: [ 'dummy' ],
                formats: [ 'sanscrit' ]
            });
        },

        'has custom routes': function(router) { assert.isArray(router.routes); },
//        'matching routes config': function(router) { assert.deepEqual(router.routes, [ 'GET', '/', 'dummy']); },

        'has custom formats': function(router) { assert.isArray(router.config.formats); },
        'matching formats config': function(router) { assert.deepEqual(router.config.formats, ['sanscrit']); },

        'has custom middleware': function(router) { assert.isArray(router.config.middleware); },
        'matching middleware config': function(router) { assert.deepEqual(router.config.middleware, xrest.defaults.middleware.concat('dummy')); }
    },

    'Router initRoutes': {
        topic: function() {
            var R = function() { Resource.apply(this, arguments); };
            sys.inherits(R, Resource);
            R.prototype.testFn1 = function() { return 'testFn1x'; };
            R.prototype.testFn2 = function() { return 'testFn2'; };

            var resource = new R({
                routes: [['get', '/test1', 'testFn1']]
            });

            var router = new Router('/mount', resource, { routes: [
                ['get', '/test2', 'testFn2'],
            ]});

            return { res: resource, rt: router };
        },
//        'routes to testFn2 first': function(r) { assert.equal(r.rt.routes[0].handler, r.res.testFn2); },
//        'routes to testFn1 after': function(r) { assert.equal(r.rt.routes[1].handler, r.res.testFn1); }
        'routes to testFn1': function(r) { assert.equal(r.rt.routes[0].handler, r.res.testFn1); }
    }
});
