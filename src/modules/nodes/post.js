var BaseNode = require('./base').BaseNode;

var PostNode = function(node) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);
};

PostNode.prototype = BaseNode.prototype;
