var express = require('express');
var assert = require('assert');
var vows = require('vows');

var xrest = require('../lib/express-rest'),
    Resource = xrest.Resource,
    Router = xrest.Router;

xrest.util.log.debug = function() {};

exports.suite = vows.describe('xRest Router').addBatch({
    'Router constructed without arguments': {
        topic: function() {
            var app = express.createServer();
            var resource = new Resource();
            return new Router(app, '/', resource, {});
        },

        'has': {
            'routes': {
                'as an array': function(router) { assert.isArray(router.routes); }
//                ,
//                'matching defaults': function(router) { assert.deepEqual(router.routes, xrest.defaults.routes); },
            },
            'formats': {
                'as an array': function(router) { assert.isArray(router.formats); },
                'matching defaults': function(router) { assert.deepEqual(router.formats, xrest.defaults.formats); },
            },
            'middleware': {
                'as an array': function(router) { assert.isArray(router.middleware); },
                'matching defaults': function(router) { assert.deepEqual(router.middleware, xrest.defaults.middleware); },
            }
        }
    },
    'Router constructed with arguments': {
        topic: function() {
            var app = express.createServer();
            var resource = new Resource();
            return new Router(app, '/', resource, {
                routes: [ 'GET', '/', 'dummy'],
                middleware: [ 'dummy' ],
                formats: [ 'sanscrit' ]
            });
        },

        'has': {
            'custom routes': {
                'as an array': function(router) { assert.isArray(router.routes); }
//                ,
//                'matching config': function(router) { assert.deepEqual(router.routes, [ 'GET', '/', 'dummy']); },
            },
            'custom formats': {
                'as an array': function(router) { assert.isArray(router.formats); },
                'matching config': function(router) { assert.deepEqual(router.formats, ['sanscrit']); }
            },
            'custom middleware': {
                'as an array': function(router) { assert.isArray(router.middleware); },
                'matching config': function(router) { assert.deepEqual(router.middleware, xrest.defaults.middleware.concat('dummy')); },
            }
        }
    }
});
