var u = require('util'),
    _ = require('lodash'),
    data = require('../data'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe person
 * @param node - {Object} base node configuration
 * @param parent - {BaseNode} parent node
 * @param personKey - {String} person key
 * @constructor
 */
var PersonNode = function(node, parent, personKey, people) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this
        .init(parent)
        .setTitle(personKey, people);
};

PersonNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param personKey - {String} key for person
 * @returns {PersonNode}
 */
PersonNode.prototype.setTitle = function(personKey, people) {
    var person = people[personKey];
    this.title = {
        en: u.format('%s %s', person.en['firstName'], person.en['lastName']),
        ru: u.format('%s %s', person.ru['firstName'], person.ru['lastName'])
    };
    return this;
};

/**
 * Sets view for node
 * @returns {PersonNode}
 */
PersonNode.prototype.setView = function() {
    this.view = this.VIEW.AUTHOR;
    return this;
};

PersonNode.prototype.setClass = function() {
    this.class = 'person';
    return this;
};

exports.PersonNode = PersonNode;
