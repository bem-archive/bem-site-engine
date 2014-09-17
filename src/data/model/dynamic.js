var _ = require('lodash'),
    susanin = require('susanin'),
    BaseNode = require('./base').BaseNode;

/**
 * Subclass of BaseNode class
 * Base class for all dynamic nodes
 * @constructor
 */
var DynamicNode = function() {};

DynamicNode.prototype = Object.create(BaseNode.prototype);

/**
 * Init function for node
 * @param parent - {Object} parent node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.init = function(parent) {

    this.setType()
        .setSize()
        .setView()
        .setHidden()
        .setLevel(parent)
        .setClass()
        .setSearch()
        .generateUniqueId()
        .setParent(parent);

    return this;
};

/**
 * Sets type for node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.setType = function() {
    this.type = this.TYPE.SIMPLE;
    return this;
};

/**
 * Sets size for node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.setSize = function() {
    this.size = this.SIZE.NORMAL;
    return this;
};

/**
 * Sets view for node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.setView = function() {
    this.view = this.VIEW.POST;
    return this;
};

/**
 * Sets hidden state for node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.setHidden = function() {
    this.hidden = {};
    return this;
};

/**
 * Sets class for node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.setClass = function() {
    this.class = 'dynamic';
    return this;
};

/**
 * Create route and url fields for dynamic nodes
 * @param routes - {Object} application routes hash
 * @param parent - {BaseNode} parent node
 * @param params - {Object} route params of node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.processRoute = function(routes, parent, params) {
    var baseRoute = parent.getBaseRoute(),
        conditions = routes[baseRoute.name].conditions;

    routes[baseRoute.name].conditions = Object.keys(params.conditions).reduce(function(prev, key) {
        prev[key] = prev[key] || [];
        prev[key] = prev[key].concat(params.conditions[key]);
        return prev;
    }, conditions || {});

    this.route = _.extend({}, { name: baseRoute.name }, params);
    this.url = susanin.Route(routes[baseRoute.name]).build(params.conditions);

    return this;
};

exports.DynamicNode = DynamicNode;
