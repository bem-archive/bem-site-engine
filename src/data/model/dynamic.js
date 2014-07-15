var u = require('util'),
    _ = require('lodash'),
    susanin = require('susanin'),
    BaseNode = require('./base').BaseNode;

/**
 * Subclass of BaseNode class
 * Base class for all dynamic nodes
 * @constructor
 */
DynamicNode = function() {};

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

DynamicNode.prototype.processRoute = function(routes, parent, conditions) {
    var baseRoute = parent.getBaseRoute();
    routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

    Object.keys(conditions.conditions).forEach(function(key) {
        routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
        routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
        routes[baseRoute.name].conditions[key] = _.uniq(routes[baseRoute.name].conditions[key]);
    });

    this.route = _.extend({}, { name: baseRoute.name }, conditions);
    this.url = susanin.Route(routes[baseRoute.name]).build(conditions.conditions);

    return this;
};

exports.DynamicNode = DynamicNode;
