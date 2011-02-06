var assert = require('assert');
var vows = require('vows');

var xrest = require('../lib/express-rest'),
    Resource = xrest.Resource,
    Route = xrest.Route;


var descriptor = {
    method:   'get',
    path:     '/test',
    handler:  'testFn',
    template: 'test'
};

var resource = new Resource();
var testFn = function() {};
resource.testFn = testFn;

function assertRoute() {
    var d = descriptor, res = resource;
    return {
        'method'  : function(r) { assert.equal(r.method,   d.method); },
        'path'    : function(r) { assert.equal(r.path,     d.path); },
        'handler' : function(r) { assert.equal(r.handler,  res[d.handler]); },
        'template': function(r) { assert.equal(r.template, d.template); },
    };
};

exports.suite = vows.describe('xRest Resource').addBatch({
    'Route constructed with array': {
        topic: function() {
            var d = descriptor;
            var r = resource;
            return new Route(r, [d.method, d.path, d.handler, d.template]);
        },
        'is initialized correctly': assertRoute()
    },
    'Route constructed with object': {
        topic: function() {
            var d = descriptor;
            var r = resource;
            return new Route(r, d);
        },
        'is initialized correctly': assertRoute()
    }
});
