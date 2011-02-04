var assert = require('assert');
var vows = require('vows');

var LIB = '../lib/express-rest';

exports.suite = vows.describe('Baseline').addBatch({
    'xRest': {
        topic: function() { return require(LIB); },

        'exports': {
            'util'    : function(xrest) { assert.isObject(xrest.util); },
            'defaults': function(xrest) { assert.isObject(xrest.defaults); },
            'Resource': function(xrest) { assert.isFunction(xrest.Resource); },
            'Router'  : function(xrest) { assert.isFunction(xrest.Router); }
        }
//        ,
//
//        'Router': {
//            topic: function(xrest) { return xrest.Router; },
//            'is a function': function(Router) { assert.isFunction(Router); },
//            'which constructs': {
//                topic: function(Router, xrest) { return new Router(); },
//                'a Router': function(router, Router) { assert.instanceof(router, Router); }
//            }
//        }
    }



//    'A Resource': {
//        'can be constructed': {
//            topic: function() { return new xrest.Resource(); },
//            'with default handlers': function(resource) {
//                vows.assert.deepEqual(resource.handlers, xrest.defaults.handlers);
//            }
//        }
//    }
});
