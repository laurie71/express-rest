http://architects.dzone.com/news/common-rest-design-pattern

# Features:

* RESTful resources can be mounted at an arbitrary URL
* RESTful resources can be defined recursively (a resource can
      internally mount another resource)
* URL/handler mappings can be customized/overridden per resource
   ** globally for the app (default mappings)
   ** when it is defined (per-resource mappings)
   ** when it is mounted (per-mount-point mappings)
* Route middleware can be applied for a resource:
   ** when it is defined (per-resource middleware)
   ** when it is mounted (per-mount-point middleware)
   ** within a handler (per-method middleware)

* content negotiation: HTML/JSON/XML formats for free
          xxx need global/per-mount/per-resource/per-method 'capabilities declaration'

* Resources define base configuration and service methods; a few
      lines of configuration and code exposes a resource as HTML/JSON/XML

# Usage:

    var sys = require('sys');
    var express = require('express');
    var rest = require('express-restful');

    var app = express.createServer();
    app.use(rest.restful({
        mappings: { ... }             // default mappings
    }));

    var route_middleware = function(req, res, next) { ...; next(); };
    app.restful(/forum/:title?, route_middleware, {
        mappings: { ... },            // per-mount-point mappings
        resource: function() {
            this.mappings = { ... };  // per-resource mappings
        }
    });

    function MyResource() {}
    sys.inherits(MyResource, rest.ResourceCollection);


Standard Handler Mappings:

GET      /res/forums           ->  index     => [{...}, ...]
GET      /res/forums?<query>   ->  index     => [{...}, ...]
PUT      /res/forums           ->   xxx      (or could alias to POST)
POST     /res/forums           ->  create
DELETE   /res/forums           ->   xxx

GET      /res/forums/:id       ->  detail
PUT      /res/forums/:id       ->  update
POST     /res/forums/:id       ->   xxx
DELETE   /res/forums/:id       ->  remove

GET     /res/forums/new        ->  create_new
GET     /res/forums/:id/edit   ->  detail_edit

TODO: ':id' needs to be configurable

Standard Template Mappings:
(examples assuming view engine is ejs; no extension is added by default)
    {
        layout: undefined,      // use Express default layout
        prefix: undefined,      // look for templates in <app>/views/...
        index:  'index',        // -> <app>/views/prefix/index.ejs'
        detail: 'detail',       // -> <app>/views/prefix/detail.ejs'
        create: 'detail_new',   // -> <app>/views/prefix/detail_new.ejs'
        update: 'detail_edit',  // -> <app>/views/prefix/detail_edit.ejs'
    }

