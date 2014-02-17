var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

var LevelNode = function(node, parent, level) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(level);
};

LevelNode.prototype = Object.create(DynamicNode.prototype);

LevelNode.prototype.setTitle = function(level) {
    this.title = {
        en: level.name,
        ru: level.name
    };
    return this;
};

LevelNode.prototype.setType = function() {
    this.type = this.TYPE.GROUP;
    return this;
};

exports.LevelNode = LevelNode;
