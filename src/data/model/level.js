var _ = require('lodash'),

    utility = require('../util'),
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe library block levels
 * @param parent - {VersionNode} parent node
 * @param routes - {Object} application routes hash
 * @param version - {Object} version object
 * @param level - {Object} level object
 * @param search - {Object} search model
 * @param blocksHash - {Object} blocks data hash
 * @constructor
 */
var LevelNode = function(parent, routes, version, level, search, blocksHash) {
    //add library block level to library search item
    _.find(search.libraries, function(item) { return version.repo === item.name; })
        .getVersion(version.ref).addLevel(new nodes.search.Level(level.name));

    this.setTitle(level)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref.replace(/\//g, '-'),
                level: level.name
            }
        })
        .init(parent)
        .addItems(routes, version, level, search, blocksHash);
};

LevelNode.prototype = Object.create(nodes.dynamic.DynamicNode.prototype);

/**
 * Sets title for node
 * @param level - {Object} level
 * @returns {LevelNode}
 */
LevelNode.prototype.setTitle = function(level) {
    this.title = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = level.name.replace(/\.(sets|docs)$/, '');
        return prev;
    }, {});

    return this;
};

/**
 * Sets type for node
 * @returns {LevelNode}
 */
LevelNode.prototype.setType = function() {
    this.type = this.TYPE.GROUP;
    return this;
};

/**
 * Sets class for node
 * @returns {LevelNode}
 */
LevelNode.prototype.setClass = function() {
    this.class = 'level';
    return this;
};

/**
 * Add block nodes as items to level
 * @param routes - {Object} application routes hash
 * @param version - {Object} version object
 * @param level - {Object} level object
 * @param search - {Object} search model
 * @param blocksHash - {Object} blocks data hash
 */
LevelNode.prototype.addItems = function(routes, version, level, search, blocksHash) {
    this.items = this.items || [];

    var blocks = level.blocks;
    if(!blocks) return;

    blocks.forEach(function(block) {

        //add library block to library search item
        _.find(search.libraries, function(item) { return version.repo === item.name; })
            .getVersion(version.ref).getLevel(level.name).addBlock(block.name);

        //create node
        var node = new nodes.block.BlockNode(this, routes, version, level, block, blocksHash);

        search.blocks.push(
            new nodes.search.Block(block.name, node.url, version.repo,
                version.ref, level.name, block.data, block.jsdoc));

        this.items.push(node);
    }, this);

    return this;
};

exports.LevelNode = LevelNode;
