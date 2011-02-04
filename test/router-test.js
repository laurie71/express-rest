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
            'default formats': function(router) { assert.deepEqual(router.formats, xrest.defaults.formats); },
            'default handlers': function(router) { assert.deepEqual(router.handlers, xrest.defaults.handlers); },
            'default middleware': function(router) { assert.deepEqual(router.middleware, xrest.defaults.middleware); },
            'default templates': function(router) { assert.deepEqual(router.templates, xrest.defaults.templates); }
        }
    },
    'Router constructed with arguments': {
        topic: function() {
            var app = express.createServer();
            var resource = new Resource();
            return new Router(app, '/', resource, {
                handlers: { index: 'index_test' },
                templates: { index: 'index-test' },
                middleware: [ 'dummy' ],
                formats: [ 'sanscrit' ]
            });
        },

        'has': {
            'custom formats': function(router) {
                assert.deepEqual(router.formats, ['sanscrit']);
            },
            'custom handlers': function(router) {
                var handlers = xrest.util.clone(xrest.defaults.handlers);
                handlers.index = 'index_test';

                assert.deepEqual(router.handlers, handlers);
            },
            'custom middleware': function(router) {
                assert.deepEqual(router.middleware, xrest.defaults.middleware.concat('dummy'));
            },
            'custom templates': function(router) {
                var templates = xrest.util.clone(xrest.defaults.templates);
                templates.index = 'index-test';

                assert.deepEqual(router.templates, templates);
            }
        }
    }
});
