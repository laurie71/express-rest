var sys = require('sys'); //xxx
var xrest = require('express-rest');
var middleware = require('./middleware');
var data = require('./data');

var clone = xrest.util.clone;
var mixin = xrest.util.mixin;

var BlogEntry = module.exports.BlogEntry = new xrest.Resource({
    templates: { prefix: 'blog/entries' }
});

mixin(BlogEntry, {
    // called for: GET /blog
    'index': function(req, res, next) {
        // fetch latest 5 blog entries from database,
        // with comments and body summarized:
        var entries = clone(data.slice(0, 5));
        entries.forEach(function(entry) {
            entry.body = entry.body.slice(0, 200) + '...';
            entry.comments = entry.comments && entry.comments.length || 0;
        });

        // pass the results to next:
        next({ entries: entries });
    },

    // called for: GET /blog/new
    // we can just rely on default behaviour for this
    //'create_new': function(req, res, next) {}

    // called for: POST /blog (todo: or POST /blog/new)
    'create': function(req, res, next) {
        // apply per-method middleware:
        // need to be authenticated to post entries:
        middleware.authenticated(req, res, function() {
            // get the logged in user
            var user = req.session.authUser;

            // build a new blog entry from the form data:
            var entry = {
                title:  req.param('title'),
                tags:   req.param('tags'),
                body:   req.param('body'),
                posted: new Date(), // fixme: format date
                by:     user
            };

            // validate the entry:
            if (! entry.title) {
                // validation failed; return to form
                req.flash('error', 'Blog entry title is required!');
            } else {
                // validation passed; store the entry
                req.flash('info', 'Blog entry posted!');
                data.unshift(entry);
            }

            // let xRest redirect to the new entry.
            // if entry.title is null/undefined,
            // xRest will automatically return to
            // the form.
            next({'id': entry.title });
        });
    },

    // called for: GET /blog/<title>
    'detail': function(req, res, next) {
        // retrieve the blog entry
        var title = req.param('id');
        var entry = this._fetch(title);

        // and return it (xRest will Do The Right Thing if entry
        // is null/undefined, and return a 404 response in the
        // appropriate format)
        next({entry: entry});
    },

    // called for: GET /blog/<title>/edit
    // we can just rely on default behaviour again
    //'detail_edit': function(req, res, next) {}

    // called for: PUT /blog/<title>
    'update': function(req, res, next) {
        // retrieve the blog entry
        var title = req.params('id');
        var entry = this._fetch(title);

        if (entry) {
            // merge form data, validate, etc...
            xrest.mixin(entry, req.body);
        }

        // todo: how to signal failed edit?
        next({entry: entry});
    },

    // called for: DELETE /blog/<title>
    'remove': function(req, res, next) {
        // todo
    },


    // resource-specific utility method to fetch an
    // instance of the resource from the database
    _fetch: function(title) {
        return data.reduce(function(prev, next) {
            return (next.title == title) ? next : prev;
        }, null);
    },

    toString: function() { return '[blog entries]'; }
});
