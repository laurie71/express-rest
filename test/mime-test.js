var assert = require('assert');
var vows = require('vows');
var sys = require('sys');

var xrest = require('../lib/express-rest'),
    mime =  require('../lib/express-rest/mime');

function assertMediaType(mediaType, expect) {
    assert.isNotNull(mediaType);
    assert.isObject(mediaType);
    assert.equal(mediaType.type, expect.type);//, 'incorrect type');
    assert.equal(mediaType.subtype, expect.subtype);//, 'incorrect subtype');
    assert.deepEqual(mediaType.params, expect.params);//, 'incorrect params');
}

function mediaTypeTests(tests) {
    var context = {};

    for (var input in tests) {
        (function() {
            var expect = tests[input];
            var output = mime.mediaType(input);
            context['media type <'+input+'>'] = function() {
                assertMediaType(output, expect);
            }
        })();
    }

    return context;
}

function mediaRangeTests(tests) {
    var context = {};

    for (var input in tests) {
        (function() {
            var expect = tests[input];
            var output = mime.mediaRange(input);
            context['media range <'+input+'>'] = function() {
                assertMediaType(output, expect);
                assert.equal(output.quality, expect.quality);
                assert.deepEqual(output.extensions, expect.extensions);
            }
        })();
    }

    return context;
}

function acceptTests(tests) {
    var context = {};

    for (var input in tests) {
        (function() {
            var expect = tests[input];
            var output = mime.accept(input);

            context['Accept: header <'+input+'>'] = function() {
                assert.isArray(output);
                assert.equal(output.length, expect.length);

                for (var i = 0; i < expect.length; i++) {
                    assertMediaType(output[i].range,
                        { type: expect[i][0]
                        , subtype: expect[i][1]
                        , params: expect[i][2]
                        }
                    );

                    assert.equal(output[i].quality, expect[i][3]);
                    assert.deepEqual(output[i].extensions, expect[i][4]);
                };
            }
        })();
    }

    return context;
}

function matchTests(tests) {
    var context = {
        topic: function() {
//console.log(sys.inspect(this));
            return this.context.name
        }
    };

    for (var supported in tests) {
        (function() {
            expected = tests[supported];
            supported = supported.split(/\s*,\s*/);
            var selected = mime.match(supported, 'text/xml, application/xml, application/xhtml+xml, text/html;q=0.9, text/plain;q=0.8, image/png,*/*;q=0.5');

            selected = selected.map(function(match) {
                return {
                    type: match.type.type+'/'+match.type.subtype,
                    quality: match.quality
                };
            });

            context[supported] = function() {
                assert.deepEqual(selected, expected);
            }
        })();
    }

    return context;
}

exports.suite = vows.describe('xRest Mime-Type Handling').addBatch({
//    'mediaType correctly parses:': mediaTypeTests({
//        '*/*': { type: '*', subtype: '*', params: [] },
//        'text/*': { type: 'text', subtype: '*', params: [] },
//        'text/plain': { type: 'text', subtype: 'plain', params: [] },
//        'text/plain;p1=0': { type: 'text', subtype: 'plain', params: [['p1', 0]]},
//        'text/plain;p1=0;p2="quoted val"': { type: 'text', subtype: 'plain', params: [['p1', '0'], ['p2', '"quoted val"']]},
//        'text/plain ; p1 = 0 ; p2 = "quoted val"': { type: 'text', subtype: 'plain', params: [['p1', '0'], ['p2', '"quoted val"']]}
//    }),
//
//    'mediaRange correctly parses:': mediaRangeTests({
//        '*/*': { range: { type: '*', subtype: '*', params: []}, quality: 1.0, extensions: [] },
//        'text/*': { range: { type: 'text', subtype: '*', params: []}, quality: 1.0, extensions: [] },
//        'text/plain': { range: { type: 'text', subtype: 'plain', params: []}, quality: 1.0, extensions: [] },
//        'text/plain;p1=1;p2=2': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 1.0, extensions: [] },
//        'text/plain;q=0.5': { range: { type: 'text', subtype: 'plain', params: []}, quality: 0.5, extensions: [] },
//        'text/plain;p1=1;p2=2;q=0.5': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 0.5, extensions: [] },
//        'text/plain;p1=1;p2=2;q=0.5;e1=1': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 0.5, extensions: [['e1','1']] },
//        'text/plain;p1=1;p2=2;q=0.5;e1=1;e2=2': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 0.5, extensions: [['e1','1'],['e2','2']] },
//        'text/plain ; p1=1 ; p2 = 2 ; q = 0.5 ; e1 = 1': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 0.5, extensions: [['e1','1']] },
//
//        'text/plain ; p1=1 ; p2 = 2 ; q = 0.5 ; e1 = 1': { range: { type: 'text', subtype: 'plain', params: [['p1','1'],['p2','2']]}, quality: 0.5, extensions: [['e1','1']] }
//    }),
//
//    'accept correctly parses:': acceptTests({
//        'text/plain, text/*, */*': [[ 'text','plain',[],1,[] ],[ 'text','*',[],1,[] ],[ '*','*',[],1,[] ]],
//
//        // IE style:
//        'image/gif, image/x-xbitmap, image/jpeg, image/pjpeg, application/x-shockwave-flash, */*':
//        [ [ 'image',        'gif',              [], 1,[] ]
//        , [ 'image',        'x-xbitmap',        [], 1,[] ]
//        , [ 'image',        'jpeg',             [], 1,[] ]
//        , [ 'image',        'pjpeg',            [], 1,[] ]
//        , [ 'application',  'x-shockwave-flash',[], 1,[] ]
//        , [ '*',            '*',                [], 1,[] ]
//        ],
//
//        // FF style:
//        'text/xml, application/xml, application/xhtml+xml, text/html;q=0.9, text/plain;q=0.8, image/png,*/*;q=0.5':
//        [ [ 'text',         'xml',      [], 1.0, [] ]
//        , [ 'application',  'xml',      [], 1.0, [] ]
//        , [ 'application',  'xhtml+xml',[], 1.0, [] ]
//        , [ 'text',         'html',     [], 0.9, [] ]
//        , [ 'text',         'plain',    [], 0.8, [] ]
//        , [ 'image',        'png',      [], 1.0, [] ]
//        , [ '*',            '*',        [], 0.5, [] ]
//        ]
//    }),

    'match correctly selects from': {
        '':
            matchTests({
//                'text/plain':
//                    [ { type: 'text/plain', quality: 0.8 }
//                    ],
//
                'text/html, text/plain, other/type':
                    [ { type: 'text/html',  quality: 0.9 }
                    , { type: 'text/plain', quality: 0.8 }
                    , { type: 'other/type', quality: 0.5 }
                    ],
            })
    }
});

