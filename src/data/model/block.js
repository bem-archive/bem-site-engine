var util = require('util'),
    sha = require('sha1'),

    utility = require('../util'),
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe library blocks
 * @param parent - {LevelNode} parent node
 * @param routes - {Object} application routes hash
 * @param version - {Object} version of library
 * @param level - {Object} version of library
 * @param block - {Object} block data
 * @param blocksHash - {Object} blocks data hash
 * @constructor
 */
var BlockNode = function(parent, routes, version, level, block, blocksHash) {
    this.setTitle(block)
        .setSource(version, level, block, blocksHash)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref.replace(/\//g, '-'),
                level: level.name,
                block: block.name
            }
        })
        .init(parent);
};

BlockNode.prototype = Object.create(nodes.dynamic.DynamicNode.prototype);

/**
 * Sets title for node
 * @param block - {Object} block
 * @returns {BlockNode}
 */
BlockNode.prototype.setTitle = function(block) {
    this.title = utility.getLanguages().reduce(function(prev, lang) {
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
BlockNode.prototype.setSource = function(version, level, block, blocksHash) {
    var source = {
            data: block.data,
            jsdoc: block.jsdoc
        },
        shaKey = sha(JSON.stringify(source));

    blocksHash[shaKey] = source;

    this.source = {
        key: shaKey,
        enb: version.enb,
        prefix: version.enb ?
            util.format('/__example/%s/%s', version.repo, version.ref) :
            util.format('/__example/%s/%s/%s.sets/%s', version.repo, version.ref, level.name, block.name)
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
