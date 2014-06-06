var _ = require('lodash'),
    sha = require('sha1');

/**
 * Node OOP presentation for runtime
 * @param node - {Object} source node object
 * @param parent - {Object} parent node object
 * @constructor
 */
var Node = function(node, parent) {
    Object.keys(node).forEach(function(key) {
        this[key] = node[key];
    }, this);

    this.setParent(parent);
};

Node.prototype = {

    VIEW: {
        INDEX: 'index',
        POST: 'post',
        POSTS: 'posts',
        AUTHOR: 'author',
        AUTHORS: 'authors',
        TAGS: 'tags',
        BLOCK: 'block'
    },
    TYPE: {
        SIMPLE: 'simple',
        GROUP: 'group',
        SELECT: 'select'
    },
    SIZE: {
        NORMAL: 'normal'
    },

    /**
     * Sets parent for current node
     * @param parent - {Object} parent node
     * @returns {Node}
     */
    setParent: function (parent) {
        this.parent = parent;
        return this;
    }
};

exports.Node = Node;
