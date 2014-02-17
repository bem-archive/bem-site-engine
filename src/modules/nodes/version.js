var u = require('util'),
    _ = require('lodash'),
    DynamicNode = require('./dynamic').DynamicNode;

exports.VersionNode = function(node, parent, version) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(version)
        .setSource(version);
};

exports.VersionNode.prototype = _.extend({}, DynamicNode.prototype, {

    setTitle: function(version) {
        this.title = {
            en: version.ref,
            ru: version.ref
        };
        return this;
    },

    setSource: function(version) {
        this.source = {
            en: {
                title: version.repo,
                content: version['readme']
            },
            ru: {
                title: version.repo,
                content: version['readme']
            }
        };
        return this;
    }
});
