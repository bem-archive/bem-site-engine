var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

var BlockNode = function(node, parent, block) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(block)
        .setSource(block);
};

BlockNode.prototype = Object.create(DynamicNode.prototype);

BlockNode.prototype.setTitle = function(block) {
    this.title = {
        en: block.name,
        ru: block.name
    };
    return this;
};

BlockNode.prototype.setSource = function(source) {
    this.source = source;
    return this;
};

BlockNode.prototype.setView = function() {
    this.view = this.VIEW.BLOCK;
    return this;
};

exports.BlockNode = BlockNode;
