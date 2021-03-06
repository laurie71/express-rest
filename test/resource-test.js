var assert = require('assert');
var vows = require('vows');

var xrest = require('../lib/express-rest'),
    Resource = xrest.Resource;

// add a default middleware so we can test ordering with
// per-resource middleware
xrest.defaults.middleware.push(function test() {});

exports.suite = vows.describe('xRest Resource').addBatch({
    'Resource constructed without arguments': {
        topic: function() {
            return new Resource();
        },

        'has': {
//            'default routes': function(resource) { assert.deepEqual(resource.routes, xrest.defaults.routes); },
            'default formats': function(resource) { assert.deepEqual(resource.formats, xrest.defaults.formats); },
            'default middleware': function(resource) { assert.deepEqual(resource.middleware, xrest.defaults.middleware); }
        }
    },
    'Resource constructed with arguments': {
        topic: function() {
            return new Resource({
                routes: [[ 'GET', '/', 'dummy']],
                middleware: [ 'dummy' ],
                formats: [ 'sanscrit' ]
            });
        },

        'has': {
//            'custom routes': function(resource) {
//                assert.deepEqual(resource.routes, [ 'GET', '/', 'dummy']);
//            },
            'custom formats': function(resource) {
                assert.deepEqual(resource.formats, ['sanscrit']);
            },
            'custom middleware': function(resource) {
                assert.deepEqual(resource.middleware, xrest.defaults.middleware.concat('dummy'));
            }
        }
    }
});
