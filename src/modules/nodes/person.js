var u = require('util'),
    _ = require('lodash'),
    data = require('../data'),
    BaseNode = require('./base').BaseNode;

exports.PersonNode = function(node, parent, personKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this.generateUniqueId();
    this.setParent(parent);
    this.setTitle(personKey);

    this.type = this.TYPE.SIMPLE;
    this.size = this.SIZE.NORMAL;
    this.view = this.VIEW.AUTHOR;
    this.hidden = {};

    this.setLevel(parent);
};

exports.PersonNode.prototype = _.extend({}, BaseNode.prototype, {

    setTitle: function(personKey) {
        var person = data.people.getPeople()[personKey];
        this.title = {
            en: u.format('%s %s', person.en['firstName'], person.en['lastName']),
            ru: u.format('%s %s', person.ru['firstName'], person.ru['lastName'])
        };
    },

    setLevel: function(parent) {
        this.level = parent.type === this.TYPE.GROUP ?
            parent.level : parent.level + 1
    }
});

