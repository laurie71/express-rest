// COPYRIGHT

var clone = require('../util').clone;

module.exports = exports = function context(initial) {
    var base = initial;

    function ctx() { return base ? clone(base) : {}; }

    return function(req, res, next) {
        req.context = res.context = (req.context || ctx());
        next();
    }
};
