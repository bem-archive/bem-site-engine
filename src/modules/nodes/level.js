var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

exports.LevelNode = function(node, parent, level) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(level);
};

exports.LevelNode.prototype = _.extend({}, DynamicNode.prototype, {

    setTitle: function(level) {
        this.title = {
            en: level.name,
            ru: level.name
        };
        return this;
    },

    setType: function() {
        this.type = this.TYPE.GROUP;
        return this;
    }
});
