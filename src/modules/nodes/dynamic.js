var u = require('util'),
    _ = require('lodash'),
    BaseNode = require('./base').BaseNode;

DynamicNode = function() {};

DynamicNode.prototype = Object.create(BaseNode.prototype);

/**
 * Init function for node
 * @param parent - {Object} parent node
 * @returns {DynamicNode}
 */
DynamicNode.prototype.init = function(parent) {

    this.generateUniqueId()
        .setParent(parent)
        .setType()
        .setSize()
        .setView()
        .setHidden()
        .setLevel(parent);

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

exports.DynamicNode = DynamicNode;
