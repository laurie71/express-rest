// COPYRIGHT

// ------------------------------------------------------------------------

exports.defaults = require('./defaults');
exports.Resource = require('./resource').Resource;
exports.Router = require('./router').Router;
exports.util = require('./util');

// ------------------------------------------------------------------------

var express = require('express'),
    sys = require('sys');

express.Server.prototype.restful = function restful(mount, resource, options) {
    options = options || {};

    exports.util.log.debug('xRest.restful: mounting resource '
        +resource+' on '+mount+'; options: '
        +JSON.stringify(options));

    var router = new exports.Router(this, mount, resource, options);
};

// ------------------------------------------------------------------------
