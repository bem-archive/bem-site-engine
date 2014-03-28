var BaseNode = require('./base').BaseNode;

var RuntimeNode = function(node, parent) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);
    this.setParent(parent);
};

RuntimeNode.prototype = Object.create(BaseNode.prototype);

exports.RuntimeNode = RuntimeNode;