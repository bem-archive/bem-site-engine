var utility = require('../util'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe tag of post
 * @param parent - {BaseNode} parent node
 * @param routes - {Object} application routes hash
 * @param tagKey - {String} tag
 * @constructor
 */
var TagNode = function(parent, routes, tagKey) {
    this.setTitle(tagKey)
        .processRoute(routes, parent, {
            conditions: {
                id: tagKey
            }
        })
        .init(parent);
};

TagNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param tagKey - {String} tag key
 * @returns {TagNode}
 */
TagNode.prototype.setTitle = function(tagKey) {
    this.title = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = tagKey;
        return prev;
    }, {});
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
