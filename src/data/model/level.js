var _ = require('lodash'),
    util = require('../lib/util'),
    logger = require('../lib/logger')(module),
    nodes = require('./index');

/**
 * Subclass of dynamic nodes which describe library block levels
 * @param parent - {VersionNode} parent node
 * @param routes - {Object} application routes hash
 * @param version - {Object} version object
 * @param level - {Object} level object
 * @param searchLibraries - {Object} search libraries model
 * @param searchBlocks - {Object} search blocks model
 * @constructor
 */
var LevelNode = function(parent, routes, version, level, searchLibraries, searchBlocks) {
    logger.verbose('level constructor %s %s %s', version.repo, version.ref, level.name);

    //add library block level to library search item
    _.find(searchLibraries, function(item) { return version.repo === item.name; })
        .getVersion(version.ref).addLevel(new nodes.search.Level(level.name));

    this.setTitle(level)
        .processRoute(routes, parent, {
            conditions: {
                lib: version.repo,
                version: version.ref,
                level: level.name
            }
        })
        .init(parent)
        .addItems(routes, version, level, searchLibraries, searchBlocks);
};

LevelNode.prototype = Object.create(nodes.dynamic.DynamicNode.prototype);

/**
 * Sets title for node
 * @param level - {Object} level
 * @returns {LevelNode}
 */
LevelNode.prototype.setTitle = function(level) {
    this.title = util.getLanguages().reduce(function(prev, lang) {
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
 * @param searchLibraries - {Object} search libraries model
 * @param searchBlocks - {Object} search blocks model
 */
LevelNode.prototype.addItems = function(routes, version, level, searchLibraries, searchBlocks) {
    logger.verbose('add blocks to level %s of version %s start', level.name, version.ref);

    this.items = this.items || [];

    var blocks = level.blocks;
    if(!blocks) return;

    blocks.forEach(function(block) {

        //add library block to library search item
        _.find(searchLibraries, function(item) { return version.repo === item.name; })
            .getVersion(version.ref).getLevel(level.name).addBlock(block.name);

        //create node
        var node = new nodes.block.BlockNode(this, routes, version, level, block);

        searchBlocks.push(
            new nodes.search.Block(block.name, node.url, version.repo,
                version.ref, level.name, block.data, block.jsdoc));

        this.items.push(node);
    }, this);

    return this;
};

exports.LevelNode = LevelNode;
