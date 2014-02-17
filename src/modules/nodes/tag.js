var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

exports.TagNode = function(node, parent, tagKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(tagKey);
};

exports.TagNode.prototype = _.extend({}, DynamicNode.prototype, {

    setTitle: function(tagKey) {
        this.title = {
            en: tagKey,
            ru: tagKey
        };
        return this;
    },

    setView: function() {
        this.view = this.VIEW.TAGS;
        return this;
    }
});
