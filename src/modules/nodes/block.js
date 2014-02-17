var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

exports.BlockNode = function(node, parent, block) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(block)
        .setSource(block);
};

exports.BlockNode.prototype = _.extend({}, DynamicNode.prototype, {

    setTitle: function(block) {
        this.title = {
            en: block.name,
            ru: block.name
        };
        return this;
    },

    setSource: function(source) {
        this.source = source;
        return this;
    },

    setView: function() {
        this.view = this.VIEW.BLOCK;
        return this;
    }
});
