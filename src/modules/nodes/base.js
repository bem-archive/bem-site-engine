var _ = require('lodash'),
    sha = require('sha1');

/**
 * Base class for nodes with common nodes methods
 * @param node - {Object} source node object
 * @param parent - {Object} parent node object
 * @constructor
 */
var BaseNode = function(node, parent) {};

BaseNode.prototype = {

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
     * @returns {BaseNode}
     */
    setParent: function (parent) {
        this.parent = parent;
        return this;
    }
};

exports.BaseNode = BaseNode;