var BaseNode = require('./base').BaseNode;

/**
 * Runtime node object wrapper inherited from BaseNode class
 * @param node - {Object} source node object
 * @param parent - {Object} parent node object
 * @constructor
 */
var RuntimeNode = function(node, parent) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);
    this.setParent(parent);
};

RuntimeNode.prototype = Object.create(BaseNode.prototype);

exports.RuntimeNode = RuntimeNode;