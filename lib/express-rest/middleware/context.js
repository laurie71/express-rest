// COPYRIGHT

var clone = require('../util').clone;

/**
 *
 */
exports = module.exports = function RequestContext(initial) {
    var base = initial;

    function mkcontext() {
        return clone(base);
    }

    return function(req, res, next) {
        req.context = res.context = mkcontext();
        next();
    }
};
