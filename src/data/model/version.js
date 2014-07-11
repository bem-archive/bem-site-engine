var u = require('util'),
    _ = require('lodash'),
    config = require('../lib/config'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe single version of library
 * @param node - {Object} base node configuration
 * @param parent - {BaseNode} parent node
 * @param version - {Object} version of library
 * @constructor
 */
var VersionNode = function(node, parent, version) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(version)
        .setSource(version);
};

VersionNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param version - {Object} library version
 * @returns {VersionNode}
 */
VersionNode.prototype.setTitle = function(version) {
    var languages = config.get('common:languages') || ['en'];
    this.title = languages.reduce(function(prev, lang) {
        prev[lang] = version.ref;
        return prev;
    }, {});
    return this;
};

/**
 * Sets source for node
 * @param version - {Object} library version
 * @returns {VersionNode}
 */
VersionNode.prototype.setSource = function(version) {
    var languages = config.get('common:languages') || ['en'],
        readme = version.readme;

    this.source = languages.reduce(function(prev, lang) {
        prev[lang] = {
            title: version.repo,
            deps: version.deps,
            url: version.url,
            content: readme ? readme[lang] : null
        };
        return prev
    }, {});

    return this;
};

/**
 * Sets class for node
 * @returns {VersionNode}
 */
VersionNode.prototype.setClass = function() {
    this.class = 'version';
    return this;
};

exports.VersionNode = VersionNode;
