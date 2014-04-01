var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe library block levels
 * @param node - {Object} base node configuration
 * @param parent - {VersionNode} parent node
 * @param level - {Object} block level data
 * @constructor
 */
var LevelNode = function(node, parent, level) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(level);
};

LevelNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param levle - {Object} level
 * @returns {LevelNode}
 */
LevelNode.prototype.setTitle = function(level) {
    this.title = {
        en: level.name.replace(/.sets/, ''),
        ru: level.name.replace(/.sets/, '')
    };
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

LevelNode.prototype.setClass = function() {
    this.class = 'level';
    return this;
};

exports.LevelNode = LevelNode;
