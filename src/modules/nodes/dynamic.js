var u = require('util'),
    _ = require('lodash'),
    BaseNode = require('./base').BaseNode;

exports.DynamicNode = function() {

};

exports.DynamicNode.prototype = _.extend({}, BaseNode.prototype, {

    init: function(parent) {
        this
            .generateUniqueId()
            .setParent(parent)
            .setType()
            .setSize()
            .setView()
            .setHidden()
            .setLevel(parent);

        return this;
    },

    setLevel: function(parent) {
        this.level = parent.type === this.TYPE.GROUP ?
            parent.level : parent.level + 1
        return this;
    },

    setType: function() {
        this.type = this.TYPE.SIMPLE;
        return this;
    },

    setSize: function() {
        this.size = this.SIZE.NORMAL;
        return this;
    },

    setView: function() {
        this.view = this.VIEW.POST;
        return this;
    },

    setHidden: function() {
        this.hidden = {};
        return this;
    }
});
