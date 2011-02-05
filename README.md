# xRest: RESTful Routing for ExpressJS

*Note*: _this project is a work in progress. It's functional and
useable already, but missing several planned features, and still
subject to API changes._

xRest provides highly configurable, extensible support for RESTful
resources in Express. By supplying xRest with just a few lines of
configuration, code, and templates, you get intelligent, re-mappable
request routing, support for multiple rendering formats (currently,
HTML and JSON out of the box) and more.

If you need a technical introduction to REST and RESTful resources,
Architect Zone's Common REST Design Pattern article [1] is a great
place to start.

[1] http://architects.dzone.com/news/common-rest-design-pattern


## xRest Features:

* xRest resources can be mounted to any URL path
* Routes can be customized/overridden:
   ** globally for all xRest resources (default routes)
   ** when a resource is defined (per-resource routes)
   ** when a resource is mounted (per-mount routes) [TODO]
* Route middleware can be applied:
   ** globally for all xRest resources (default middleware)
   ** when a resource is defined (per-resource middleware)
   ** when a resource is mounted (per-mount middleware)
   ** within individutal routes (per-route middleware) [TODO]
* RESTful resources can be defined recursively (a resource can
      internally mount another resource) [TODO]
* Content Negotiation: HTML/JSON/XML formats for free, and
    easilly extensible with other custom formats [TODO]


## Usage:

Creating an xRest resource is easy:

    var sys = require('sys');
    var xrest = require('express-rest');

    function UsersResource();
    sys.inherits(UsersResource, xrest.Resource);

    UsersResource.prototype.fetchItem = function(req, res, next) {
        var id = req.id; // default item key set by xRest
        var item = ...;  // fetch user from database
        req.item = item; // store it for use in later route handlers
    };

You can add other functions to the prototype as needed. The
default configuration will call various functions if you've
defined them, to pre-fetch data or process requests which
create or change it.

Once you have a resource, you need to mount it in your Express
application:

    var express = require('express');
    var app = express.createServer();
    app.restful('/users', new UsersResource());

Done! xRest automatically sets up various routes for you:

| =HTTP Method= | =Path=         | =Calls Handler=  | =Renders Template= |
| GET           | /$             | fetchAll         | /(none)/ |
| GET           | /$             | itemList         | index |
| POST          | /$             | itemCreate       | /(none)/ |
| GET           | /{new}         | itemCreateForm   | create_new |
| GET           | /:{key}/:op?   | fetchItem        | /(none)/ |
| GET           | /:{key}        | itemDetail       | detail |
| PUT           | /:{key}        | itemUpdate       | /(none)/ |
| GET           | /:{key}/{edit} | itemUpdateForm   | detail_edit |
| DEL           | /:{key}        | itemRemove       | /(none)/ |

Paths use ``{name}``-style placeholders, the values of which you can
override at various levels (globally, per-resource, per-mount).

You implement the handler functions you need on your resource, and
supply the templates. The default configuration expects several
templates to be defined for serving HTML responses, as shown above.
If you only need to serve JSON, though, you don't need any of them.


## More Information

Additional documentation, including a full API reference, is available
on the xRest website [2] on GitHub.

[2] http://laurie71.github.com/express-rest/

## License

xRest is distributed under the MIT license. Contributions are very
welcome :-)
