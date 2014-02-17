var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

var TagNode = function(node, parent, tagKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(tagKey);
};

TagNode.prototype = Object.create(DynamicNode.prototype)

TagNode.prototype.setTitle = function(tagKey) {
    this.title = {
        en: tagKey,
        ru: tagKey
    };
    return this;
};

TagNode.prototype.setView = function() {
    this.view = this.VIEW.TAGS;
    return this;
};

exports.TagNode = TagNode;
