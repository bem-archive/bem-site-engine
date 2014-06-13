var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe tag of post
 * @param node - {Object} base node configuration
 * @param parent - {BaseNode} parent node
 * @param tagKey - {String} tag
 * @constructor
 */
var TagNode = function(node, parent, tagKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(tagKey);
};

TagNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param tagKey - {String} tag key
 * @returns {TagNode}
 */
TagNode.prototype.setTitle = function(tagKey) {
    this.title = {
        en: tagKey,
        ru: tagKey
    };
    return this;
};

/**
 * Sets view for node
 * @returns {TagNode}
 */
TagNode.prototype.setView = function() {
    this.view = this.VIEW.TAGS;
    return this;
};

/**
 * Sets class for node
 * @returns {TagNode}
 */
TagNode.prototype.setClass = function() {
    this.class = 'tag';
    return this;
};

exports.TagNode = TagNode;
