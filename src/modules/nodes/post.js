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
    this.source = {
        en: {
            title: config.title.en,
            content: version[config.key]
        },
        ru: {
            title: config.title.ru,
            content: version[config.key]
        }
    };
    return this;
};

exports.PostNode = PostNode;
