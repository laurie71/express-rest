// COPYRIGHT

// Application-specific middleware. These are pretty dumb; they're
// just here so you can see how they're applied elsewhere.
// See uses in: app.js, app/resources.js

// a middleware to log requests.
//
// applied in: app.js, as a global middleware (affects all xRest routed requests)
module.exports.logger = function(req, res, next) {
    // TODO: implement it
    // TODO: apply it
    next();
};

// a middleware that checks the user is logged in before proceeding.
// -- if the user is logged in, calls next()
// -- if the user is not logged in, returns access denied response
//
// applied in: ./resources.js, as a per-method middleware
module.exports.authenticated = function(req, res, next) {
    // TODO: implement it
    // TODO: apply it
    req.session.authUser = 'Laurie';
    next();
};
