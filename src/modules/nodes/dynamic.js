var u = require('util'),
    _ = require('lodash'),
    BaseNode = require('./base').BaseNode;

DynamicNode = function() {};

DynamicNode.prototype = Object.create(BaseNode.prototype);

DynamicNode.prototype.init = function(parent) {

    this.generateUniqueId()
        .setParent(parent)
        .setType()
        .setSize()
        .setView()
        .setHidden()
        .setLevel(parent);

    return this;
};

DynamicNode.prototype.setLevel = function(parent) {
    this.level = parent.type === this.TYPE.GROUP ? parent.level : parent.level + 1;
    return this;
};

DynamicNode.prototype.setType = function() {
    this.type = this.TYPE.SIMPLE;
    return this;
};

DynamicNode.prototype.setSize = function() {
    this.size = this.SIZE.NORMAL;
    return this;
};

DynamicNode.prototype.setView = function() {
    this.view = this.VIEW.POST;
    return this;
};

DynamicNode.prototype.setHidden = function() {
    this.hidden = {};
    return this;
};

exports.DynamicNode = DynamicNode;