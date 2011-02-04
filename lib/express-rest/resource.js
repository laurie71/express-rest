// COPYRIGHT

var defaults = require('./defaults');
var util = require('./util');

// ------------------------------------------------------------------------

exports.Resource = Resource;

// ------------------------------------------------------------------------

/**
 * @param {Object} config (optional) Resource configuration. See the
 *      {@link Resource} documentation for details of supported options.
 *
 * @constructs
 * @class
 *
 * Base class for RESTful resources.
 *
 * <p><h1>Configuration</h1>
 * <t>Resource</t> accepts the following options in its <code>config</code>
 * parameter, all optional:
 * <ul>
 * <li>@param {String} routeKey
 * <li>@param {String} routeNew
 * <li>@param {String} routeEdit
 * </ul>
 * </p>
 */
function Resource(config) {
    this.config = config = config || {};
    defaults.configure(this, config);
};

util.mixin(Resource.prototype, {
    toString: function() {
        var type = __proto__.constructor.name || 'resource';
        return '['+type+' Resource]';
    }
});
