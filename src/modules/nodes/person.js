var u = require('util'),
    _ = require('lodash'),
    data = require('../data'),
    DynamicNode = require('./dynamic').DynamicNode;

exports.PersonNode = function(node, parent, personKey) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(personKey);
};

exports.PersonNode.prototype = _.extend({}, DynamicNode.prototype, {

    setTitle: function(personKey) {
        var person = data.people.getPeople()[personKey];
        this.title = {
            en: u.format('%s %s', person.en['firstName'], person.en['lastName']),
            ru: u.format('%s %s', person.ru['firstName'], person.ru['lastName'])
        };
    },

    setView: function() {
        this.view = this.VIEW.AUTHOR;
        return this;
    }
});

