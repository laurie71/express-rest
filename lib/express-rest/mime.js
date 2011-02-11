// COPYRIGHT

// MIME-type parsing for HTTP Content-Type: and Accept: headers,
// plus support for matching media types against the Accept: header.
//
// nitty gritty details here:
//
// [1] http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
// [2] http://www.xml.com/pub/a/2005/06/08/restful.html
//
// note, though, that this implementation correctly
// separates media-type parameters and accept-extensions,
// which [2] doesn't.

// ------------------------------------------------------------------------

var mime = module.exports = {
    mediaType: mediaType,
    mediaRange: mediaRange,
    contentType: contentType,
    accept: accept,
    match: match
};

// ------------------------------------------------------------------------

function mediaType(type) {
    // parse out type/subtype/params
    var tsp = type.split(/\s*;\s*/),// split type/subtype from params
        ts = tsp[0].split('/'),     // split type from subtype
        ps = tsp.slice(1),          // parameters
        t = ts[0] || '*',           // type
        s = ts[1] || '*';           // subtype

    // parse params into an ordered list of name/value pairs
    ps = ps.map(function(param) {
        param = /^\s*([^=\s]*)\s*=\s*(.*)\s*$/.exec(param);
        return [param[1], param[2]];
    });

    return { type: t, subtype: s, params: ps };
}

function mediaRange(range) {
    // convert range to media-type
    range = mediaType(range);

    // extract quality/extensions from media-type
    var params = range.params,
        qseen = false,
        ps = [],
        es = [],
        q  = 1;

    for (var i = 0; i < params.length; i++) {
        if (! qseen) {
            if (params[i][0] === 'q') {
                //q = Math.clamp(parseFloat(params[i][1]), 0, 1);
                q = parseFloat(params[i][1]);
                qseen = true;
            } else {
                ps.push(params[i]);
            }
        } else {
            es.push(params[i]);
        }
    }

    range.params = ps; // remove quality/es from media-type params

    return { range: range, quality: q, extensions: es };
}

function contentType(str) {
    return mediaType(str);
}

function accept(header) {
    // split into media-ranges
    header = header.split(/\s*,\s*/);
    header = header.map(function(range) {
        return mediaRange(range);
    });
    return header;
}

// score each mime-type in types against accepts
// return types that are matched by accepts, in order of quality
// @param {[string]} types
// @param {String} accepts
function match(types, accepts) {
    if (! Array.isArray(types)) {
        types = [types];
    }
    accepts = accept(accepts);

    function score(mediaType) {
        var bestScore = 0,
            bestQuality = 0;

        accepts.forEach(function(accept) {
            var score = 0;

            // if media-type matches range:
            if ((accept.range.type == '*' || accept.range.type == mediaType.type) &&
                (accept.range.subtype == '*' || accept.range.subtype == mediaType.subtype)) {

                // score +100 for type match
                if (accept.range.type == '*' || accept.range.type == mediaType.type) {
                    score += 100;
                }

                // score +10 for subtype match
                if (accept.range.subtype == '*' || accept.range.subtype == mediaType.subtype) {
                    score += 10;
                }

                // score +1 for each matching parameter
                if (mediaType.params.length) {
                    // convert range params to map for quick lookup
                    var params = {};
                    accept.range.params.forEach(function (p) {
                        params[p[0]] = p[1];
                    });

                    // score for params
                    mediaType.params,forEach(function(p) {
                        if (p[0] in params && p[1] == params[p[0]]) {
                            ++score;
                        }
                    });
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestQuality = accept.quality;
            }
        });

        return bestQuality;
    }

    return types.map(function(type) { return mediaType(type); })
                .map(function(type) { return { type: type, quality: score(type) }; })
                .filter(function(type) { return type.quality > 0; })
                .sort(function(a, b) { return a.score - b.score; });
}



