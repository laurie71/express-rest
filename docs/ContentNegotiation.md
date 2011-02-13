# Content Negotiation

xRest resources support automatic content negotiation. xRest will select
a response format based on the file extension in the request path, the
HTTP Accept header supplied with the request, and the list of formats
and media types the resource supports.


## Format Selection

xRest considers three sources when performing content negotiation:

 1. The file extension in the request URL path.

 2.


## Built-In Formats

Out of the box, xRest supports `text/html` (.html), `application/json`
(.json) and `text/plain` (.txt) response formats, as follows:

 1. `text/html` (.html)

    xRest will call ``res.render()`` with the template defined for
    the current route, passing the xRest context as the ``locals``
    member of the render options:

        res.render(template, { locals: context })

    If the route doesn't have a template associated with it (specified
    when the resource was mounted, when it was defined, or in the xRest
    defaults), an HTTP 406 response is returned.

 2. `application/json` (.json)

    xRest will call ``res.render()`` with the xRest context directly,
    which will call ``JSON.stringify()`` on the context object and
    return the result.

 3. `javascript/jsonp` (.js) [xxx ???]

 4. `text/plain` (.txt)

    xRest will look for a ``toString()`` method defined on the xRest
    context, and return the result of calling it.

    If the context object doesn't define ``toString()`` locally (i.e.
    it inherits if from ``Object`` or an intermediate type), xRest will
    return the result of ``JSON.stringify(context)`` instead.


## Specifying Supported Formats


## Adding Additional Formats
