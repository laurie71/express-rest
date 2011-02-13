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

var sys = require('sys');
var util = require('./util');
var lookup = require('connect/utils').mime.type;


var mime = module.exports = {
    MediaType: MediaType,
    MediaRange: MediaRange,
    MediaAccept: MediaAccept,

    mediaType: mediaType,
    mediaRange: mediaRange,
    accept: accept,

    type: require('connect/utils').mime.type
};

// ------------------------------------------------------------------------

function MediaType(type) {
    if (type && type.indexOf('/') < 0) {
        type = lookup(type[0] == '.' ? type : '.'+type);
    }
    if (! type) throw new TypeError('unknown media type');

    this._init(mediaType(type));
};

util.mixin(MediaType.prototype, {
    _init: function(type) {
        this._mt = type;
        this._params = null;
        this._str = null;


        Object.defineProperty(this, 'type',    {
            enumerable: true,
            value: this._mt.type
        });
        Object.defineProperty(this, 'subtype', {
            enumerable: true,
            value: this._mt.subtype
        });
        Object.defineProperty(this, 'params',  {
            enumerable: true,
            get: function() {
                // lazy init
                if (this._params === null) {
                    this._params = {};
                    this._mt.params.forEach(function(p) {
                        this._params[p[0]] = p[1];
                    }, this);
                }

                // return copy to preserve immutability
                return util.mixin({}, this._params);
            }
        });
    },

//    get type() { /*return this._mt.type;*/ },
//
//    get subtype() { return this._mt.subtype; },
//
//    get params() {
//        // lazy init
//        if (this._params === null) {
//            this._params = {};
//            this._mt.params.forEach(function(p) {
//                this._params[p[0]] = p[1];
//            });
//        }
//        // return copy to preserve immutability
//        return util.mixin({}, this._params);
//    },

    toString: function() {
        if (this._str === null) {
            this._str = this._mt.type + '/' + this._mt.subtype;
            this._mt.params.forEach(function (p) {
                this._str += ';' + p[0] + '=' + p[1];
            });
        }
        return this._str;
    }
});


function MediaRange(type) {
    //(no super.ctor call)
    this._mr = mediaRange(type);
    this._init(this._mr.range);
    this._ext = null;

    Object.defineProperty(this, 'quality', {
        enumerable: true,
        value: this._mr.quality
    });
    Object.defineProperty(this, 'extensions', {
        enumerable: true,
        get: function() {
            if (this._ext === null) {
                this._ext = {};
                this._mr.extensions.forEach(function (e) {
                    this._ext[e[0]] = e[1];
                }, this);
            }
            return this._ext;
        }
    });
};

sys.inherits(MediaRange, MediaType);

util.mixin(MediaRange.prototype, {
//    get quality() { return this._mr.quality; },
//
//    get extensions() {
//        if (this._ext === null) {
//            this._ext = {};
//            this._mt.extensions.forEach(function (e) {
//                this._ext[e[0]] = e[1];
//            }, this);
//        }
//        return this._ext;
//    }
});


function MediaAccept(types) {
    types = types.split(/\s*,\s*/);
    this._ranges = types.map(function(type) {
        return new MediaRange(type);
    }, this);
    this._str = null;
};

util.mixin(MediaAccept.prototype, {
    // score media type 'media' against media range 'range',
    // to determine the 'fitness' of the range when selecting
    // for that media type
    _score: function(range, media) {
        var score = 0,
            rp = range.params,
            mp = media.params,
            tmatch = (range.type == '*' || range.type == media.type),
            stmatch = (range.subtype == '*' || range.subtype == media.subtype);

        // if media-type matches range, score:
        // +100 for type match;
        // +10 for subtype match;
        // +1 for each parameter match
        if (tmatch && stmatch) {
            score = (tmatch ? 100 : 0)
                  + (stmatch ? 10 : 0);

            for (p in mp) if (mp.hasOwnProperty(p)) {
                if ((p in rp) && (rp[p] == mp[p])) {
                    ++score;
                }
            }
        }

        return score;
    },

    // return the accepted media range that best matches the given
    // media type
    _select: function(media) {
        var bestRange = null,
            bestScore = 0,
            score;

        this._ranges.forEach(function(range) {
            score = this._score(range, media);

            if (score > bestScore) {
                bestScore = score;
                bestRange = range;
            }
        }, this);

        return bestRange;
    },

    // @param {String|MediaType|Array} mediaTypes
    match: function(mediaTypes) {
        if (! Array.isArray(mediaTypes)) {
            mediaTypes = [mediaTypes];
        }

        // parse media types specified in string format
        mediaTypes = mediaTypes.map(function(type) {
            return (typeof(type) === 'string')
                ? new MediaType(type)
                : type;
        }, this);

        // select best range for each type, filter out
        // non-matches (types we don't accept), and
        // sort by quality
        mediaTypes = mediaTypes
            .map(function(type) {
                var range = this._select(type);
                return range
                    ? { media: type, range: range }
                    : null;
            }, this)
            .filter(function (result) {
                return result != null;
            }, this)
            .sort(function(a, b) {
                return b.range.quality - a.range.quality;
            });

        return mediaTypes;
    },

    toString: function() {
        if (this._str === null) {
            this._str = this._ranges
                .map(function(range) { return range.toString()})
                .join(', ');
        }
        return this._str;
    }
});

// ------------------------------------------------------------------------
// Low-level utility functions

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
    }, this);

    return { type: t, subtype: s, params: ps };
}

function mediaRange(range) {
    // convert range to media-type
    if (! (range instanceof MediaType)) {
        range = mediaType(range);
    }

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

function accept(header) {
    // split into media-ranges
    header = header.split(/\s*,\s*/);
    header = header.map(function(range) {
        return mediaRange(range);
    });
    return header;
}

//// score each mime-type in types against accepts
//// return types that are matched by accepts, in order of quality
//// @param {[string]} types
//// @param {String} accepts
//function match(types, accepts) {
//    if (! Array.isArray(types)) {
//        types = [types];
//    }
//    accepts = accept(accepts);
//
////    function score(mediaType) {
////        var bestScore = 0,
////            bestQuality = 0;
////
////        accepts.forEach(function(accept) {
////            var score = 0;
////
////            // if media-type matches range:
////            if ((accept.range.type == '*' || accept.range.type == mediaType.type) &&
////                (accept.range.subtype == '*' || accept.range.subtype == mediaType.subtype)) {
////
////                // score +100 for type match
////                if (accept.range.type == '*' || accept.range.type == mediaType.type) {
////                    score += 100;
////                }
////
////                // score +10 for subtype match
////                if (accept.range.subtype == '*' || accept.range.subtype == mediaType.subtype) {
////                    score += 10;
////                }
////
////                // score +1 for each matching parameter
////                if (mediaType.params.length) {
////                    // convert range params to map for quick lookup
////                    var params = {};
////                    accept.range.params.forEach(function (p) {
////                        params[p[0]] = p[1];
////                    });
////
////                    // score for params
////                    mediaType.params.forEach(function(p) {
////                        if (p[0] in params && p[1] == params[p[0]]) {
////                            ++score;
////                        }
////                    });
////                }
////            }
////
////            if (score > bestScore) {
////                bestScore = score;
////                bestQuality = accept.quality;
////            }
////        }, this);
////
////        return bestQuality;
////    }
//
//    return types.map(function(type) { return mediaType(type); })
//                .map(function(type) { return { range: type, quality: score(type) }; })
//                .filter(function(type) { return type.quality > 0; })
//                //.sort(function(a, b) { return a.quality - b.quality; })
//                .sort(function(a, b) { return 1; })
//                ;
//}
//
//
//
