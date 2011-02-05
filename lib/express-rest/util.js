// COPYRIGHT

var sys = require('sys');

/** @namespace */
var util = module.exports;

/**
 * Sane replacement for the <code>typeof</code> operator which safely
 * distinguishes arrays and nulls from other types of value. The
 * following table compares the two:
 * <table>
 *   <thead>
 *     <tr><th>Input</th>   <th><code>typeOf</code></th>  <th><code>typeof</code></th></tr>
 *   </thead>
 *   <tbody>
 *     <tr><td>Object</td>      <td>'object'</td>           <td>'object'</td></tr>
 *     <tr><td>Array</td>       <td>'array'</td>            <td><em>'object'</em></td></tr>
 *     <tr><td>Function</td>    <td>'function'</td>         <td>'function'</td></tr>
 *     <tr><td>String</td>      <td>'string'</td>           <td>'string'</td></tr>
 *     <tr><td>Number</td>      <td>'number'</td>           <td>'number'</td></tr>
 *     <tr><td>Boolean</td>     <td>'boolean'</td>          <td>'boolean'</td></tr>
 *     <tr><td>undefined</td>   <td>'undefined'</td>        <td>'undefined'</td></tr>
 *     <tr><td>null</td>        <td>'null'</td>             <td><em>'object'</em></td></tr>
 *   </tbody>
 * </table>
 */
util.typeOf = function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length')) &&
                    typeof value.splice === 'function') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
};

/**
 * Create a deep copy of <code>source</code>.
 * TODO DOCS more detail
 * To create a shallow copy, use mixin({}, source)...

 * @param {any} source
 * @return ...
 */
util.clone = function clone(source) {
    var target, type = util.typeOf(source);
    switch (type) {
        case 'array':
            target = [];
            for (var i = 0, ilen = source.length; i < ilen; i++) {
                target[i] = clone(source[i]);
            }
            break;
        case 'object':
            target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = clone(source[prop]);
                }
            }
            break;
        default:
            target = source;
    }
    return target;
};

/**
 * @param {Object} target
 * @param {Object} source1,source2,...
 * @return <code>target</code>
 */
util.mixin = function mixin(target) {
    var sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
        var source = sources.shift();
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
};

util.log = {
    debug: sys.debug
};


util.template = function(template, args) {
    if (! args) return(template);

    TEMPLATE_RE.lastIndex = 0;
    var match, last = 0, result = '';
    while ((match = TEMPLATE_RE.exec(template)) != null) {
        var name = match[1],
            value = args[name],
            start = match.index,
            end = TEMPLATE_RE.lastIndex;

        result += template.slice(last, start);
        result += (value == undefined) ? match[0] : value.toString();

        last = end;
    }

    result += template.slice(last);

    return result;
};

var TEMPLATE_RE = /\{([_a-zA-Z][\w_]*)\}/g;
