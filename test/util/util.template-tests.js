var assert = require('assert');
var vows = require('vows');

var T = require('../../lib/express-rest/util').template;

var tests = [
    [null, '', ''],
    [null, 'x', 'x'],
    [null, '{x}', '{x}'],
    [null, 'x{x}x', 'x{x}x'],

    [{}, '',''],
    [{}, 'x','x'],
    [{}, '{x}','{x}'],
    [{}, 'x{x}x','x{x}x'],

    [{foo:'bar'}, '', ''],
    [{foo:'bar'}, 'x', 'x'],
    [{foo:'bar'}, '{x}', '{x}'],
    [{foo:'bar'}, '{foo}', 'bar'],
    [{foo:'bar'}, 'x{foo}', 'xbar'],
    [{foo:'bar'}, '{foo}x', 'barx'],
    [{foo:'bar'}, 'x{foo}x', 'xbarx'],
    [{foo:'bar'}, 'x {foo} {foo} x', 'x bar bar x'],

[{foo:'bar'}, 'xxx {xxx} foo {foo} qqq', 'xxx {xxx} foo bar qqq']

];

function makeVow(sin, args, out) {
    return function() { assert.equal(T(sin, args), out); }
}

function makeVows() {
    var ctx = {};

    for (var i = 0; i < tests.length; i++) {
        var test = tests[i];
            args = test[0],
            sin = test[1],
            sout = test[2];

        var label = "util.template('"+sin+"', "+JSON.stringify(args)+")";
        var vow = makeVow(sin, args, sout);
        ctx[label] = vow;
    }

    return ctx;
};

exports.suite = vows.describe('util').addBatch({
//    'util.template': {
//        'a': function() { assert.equal(T('', null), ''); },
//        'b': function() { assert.equal(T('x', null), 'x'); }
//    }
'template tests': makeVows()
});
