var _ = require('lodash'),
    sha = require('sha1');

/**
 * Base class for nodes with common nodes methods
 * @param node - {Object} source node object
 * @param parent - {Object} parent node object
 * @constructor
 */
var BaseNode = function(node, parent) {
    Object.keys(node).forEach(function(key) { this[key] = node[key]; }, this);

    this.generateUniqueId()
        .setParent(parent)
        .setSize()
        .setTitle()
        .setHidden()
        .setView()
        .setLevel(parent)
        .setClass();
};

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
     * Return base route for node
     * Route of one of parent nodes which have route pattern
     * @returns {Object}
     */
    getBaseRoute: function () {
        if (this.route && this.route.pattern) {
            return this.route;
        }

        if (this.parent) {
            return this.parent.getBaseRoute();
        }
    },

    /**
     * Generate unique id for node as sha sum of node object
     * @returns {BaseNode}
     */
    generateUniqueId: function () {
        this.id = sha(JSON.stringify(this));
        return this;
    },

    /**
     * Sets parent for current node
     * @param parent - {Object} parent node
     * @returns {BaseNode}
     */
    setParent: function (parent) {
        this.parent = parent;
        return this;
    },

    /**
     * Makes title consistent
     * @param node {BaseNode}
     */
    setTitle: function () {
        if (this.title && _.isString(this.title)) {
            this.title = {
                en: this.title,
                ru: this.title
            };
        }
        return this;
    },

    /**
     * Sets view for node
     * @returns {BaseNode}
     */
    setView: function () {
        this.view = this.view ||
            (this.source ? this.VIEW.POST : this.VIEW.POSTS);
        return this;
    },

    /**
     * Sets size for node
     * @returns {BaseNode}
     */
    setSize: function () {
        this.size = this.size || this.SIZE.NORMAL;
        return this;
    },

    /**
     * Sets level for node
     * @param parent - {Object} parent node
     * @returns {BaseNode}
     */
    setLevel: function (parent) {
        this.level = (parent.type === this.TYPE.GROUP || parent.type === this.TYPE.SELECT) ?
            parent.level : parent.level + 1;
        return this;
    },

    /**
     * Set hidden state for node
     * @param node {Object} - single node of sitemap model
     */
    setHidden: function () {

        //show node for all locales
        if (!this.hidden) {
            this.hidden = {};
            return this;
        }

        //hide node for locales that exists in node hidden array
        if (_.isArray(this.hidden)) {
            this.hidden = {
                en: this.hidden.indexOf('en') !== -1,
                ru: this.hidden.indexOf('ru') !== -1
            };
            return this;
        }

        //hide node for all locales
        if (this.hidden === true) {
            this.hidden = {
                en: true,
                ru: true
            };
            return this;
        }

        return this;
    },

    /**
     * Sets class for node
     * @returns {BaseNode}
     */
    setClass: function () {
        this.class = 'base';
        return this;
    },

    /**
     * Creates breadcrumbs for current node
     * as suitable structure for templating
     */
    createBreadcrumbs: function () {
        this.breadcrumbs = [];

        var self = this,
            traverse = function (node) {
                if (node.url) {
                    self.breadcrumbs.unshift({
                        title: node.title,
                        url: node !== self ? node.url : null
                    });
                }

                if (node.parent) {
                    traverse(node.parent);
                }
            };

        traverse(this);

    }
};

exports.BaseNode = BaseNode;
