var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe post of library
 * @param node - {Object} base node configuration
 * @param parent - {VersionNode} parent node
 * @param config - {Object} advanced configuration object
 * @constructor
 */
var PostNode = function(node, parent, version, config) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(version, config)
        .setSource(version, config);

    this.createBreadcrumbs();
};

PostNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param version - {Object} library version
 * @param config - {Object} advanced configuration object
 * @returns {PostNode}
 */
PostNode.prototype.setTitle = function(version, config) {
    this.title = config.title;
    return this;
};

/**
 * Sets source for node
 * @param version - {Object} library version
 * @param config - {Object} advanced configuration object
 * @returns {PostNode}
 */
PostNode.prototype.setSource = function(version, config) {
    var p = version[config.key];
    this.source = {
        en: {
            title: config.title.en,
            content: (p && p.en) ? p.en : p
        },
        ru: {
            title: config.title.ru,
            content: (p && p.ru) ? p.ru : p
        }
    };
    return this;
};

/**
 * Sets class for node
 * @returns {PostNode}
 */
PostNode.prototype.setClass = function() {
    this.class = 'post';
    return this;
};

exports.PostNode = PostNode;
