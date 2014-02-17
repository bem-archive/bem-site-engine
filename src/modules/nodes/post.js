var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

var PostNode = function(node, parent, version, config) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(version, config)
        .setSource(version, config);
};

PostNode.prototype = Object.create(DynamicNode.prototype)

PostNode.prototype.setTitle = function(version, config) {
    this.title = config.title;
    return this;
};

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
