var u = require('util'),
    _ = require('lodash'),
    config = require('../lib/config'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe library blocks
 * @param node - {Object} base node configuration
 * @param parent - {LevelNode} parent node
 * @param block - {Object} block data
 * @constructor
 */
var BlockNode = function(parent, routes, version, level, block) {
    this.setTitle(block)
        .setSource(version, level, block)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref,
                level: level.name,
                block: block.name
            }
        })
        .init(parent);
};

BlockNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param block - {Object} block
 * @returns {BlockNode}
 */
BlockNode.prototype.setTitle = function(block) {
    var languages = config.get('common:languages') || ['en'];
    this.title = languages.reduce(function(prev, lang) {
        prev[lang] = block.name;
        return prev;
    }, {});
    return this;
};

/**
 * Sets source for node
 * @param source - {Object} source
 * @returns {BlockNode}
 */
BlockNode.prototype.setSource = function(version, level, block) {
    var examplePrefix = version.enb ?
        u.format('/__example/%s/%s', version.repo, version.ref) :
        u.format('/__example/%s/%s/%s.sets/%s', version.repo, version.ref, level.name, block.name);

    this.source = {
        prefix: examplePrefix,
        data: block.data,
        jsdoc: block.jsdoc
    };
    return this;
};

/**
 * Sets view for node
 * @returns {BlockNode}
 */
BlockNode.prototype.setView = function() {
    this.view = this.VIEW.BLOCK;
    return this;
};

/**
 * Sets class for node
 * @returns {BlockNode}
 */
BlockNode.prototype.setClass = function() {
    this.class = 'block';
    return this;
};

exports.BlockNode = BlockNode;
