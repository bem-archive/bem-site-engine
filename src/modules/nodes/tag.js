var u = require('util'),
    _ = require('lodash'),
    BaseNode = require('./base').BaseNode;

exports.TagNode = function(node, parent, tagKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this.generateUniqueId();
    this.setParent(parent);
    this.setTitle(tagKey);

    this.type = this.TYPE.SIMPLE;
    this.size = this.SIZE.NORMAL;
    this.view = this.VIEW.TAGS;
    this.hidden = {};

    this.setLevel(parent);
};

exports.TagNode.prototype = _.extend({}, BaseNode.prototype, {

    setTitle: function(tagKey) {
        this.title = {
            en: tagKey,
            ru: tagKey
        };
    },

    setLevel: function(parent) {
        this.level = parent.type === this.TYPE.GROUP ?
            parent.level : parent.level + 1
    }
});
