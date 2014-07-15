var u = require('util'),
    _ = require('lodash'),
    config = require('../lib/config'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe post of library
 * @param node - {Object} base node configuration
 * @param parent - {VersionNode} parent node
 * @param config - {Object} advanced configuration object
 * @constructor
 */
var PostNode = function(parent, routes, version, doc, id) {
    this.setTitle(doc)
        .setSource(doc)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref,
                id: id
            }
        })
        .init(parent)
        .createBreadcrumbs();
};

PostNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param config - {Object} advanced configuration object
 * @returns {PostNode}
 */
PostNode.prototype.setTitle = function(config) {
    this.title = config.title;
    return this;
};

/**
 * Sets source for node
 * @param doc - {Object} advanced configuration object
 * @returns {PostNode}
 */
PostNode.prototype.setSource = function(doc) {
    var languages = config.get('common:languages') || ['en'];

    this.source = languages.reduce(function(prev, lang) {
        prev[lang] = {
            title: doc.title[lang],
            content: doc.content[lang]
        };
        return prev
    }, {});

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
