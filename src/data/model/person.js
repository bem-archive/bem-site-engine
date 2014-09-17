var util = require('util'),
    utility = require('../util'),
    DynamicNode = require('./dynamic').DynamicNode;

/**
 * Subclass of dynamic nodes which describe person
 * @param parent - {BaseNode} parent node
 * @param routes - {Object} application routes hash
 * @param key - {String} person data
 * @param people - {Object} people data
 * @constructor
 */
var PersonNode = function(parent, routes, key, people) {
    this
        .setTitle(people[key])
        .processRoute(routes, parent, {
            conditions: {
                id: key
            }
        })
        .init(parent);

};

PersonNode.prototype = Object.create(DynamicNode.prototype);

/**
 * Sets title for node
 * @param person - {Object} object data for person
 * @returns {PersonNode}
 */
PersonNode.prototype.setTitle = function(person) {
    this.title = utility.getLanguages().reduce(function(prev, lang) {
        prev[lang] = util.format('%s %s', person[lang]['firstName'], person[lang]['lastName']);
        return prev;
    }, {});
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

/**
 * Sets class for node
 * @returns {PersonNode}
 */
PersonNode.prototype.setClass = function() {
    this.class = 'person';
    return this;
};

exports.PersonNode = PersonNode;
