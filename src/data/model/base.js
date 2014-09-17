var _ = require('lodash'),
    sha = require('sha1'),
    susanin = require('susanin'),

    constants = require('../constants');

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
        .setClass()
        .setSearch();
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
    SITEMAP_XML: {
        FREQUENCIES: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
        DEFAULT: {
            changefreq: 'weekly',
            priority: 0.5
        }
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
                        url: node.url
                    });
                }

                if (node.parent) {
                    traverse(node.parent);
                }
            };

        traverse(this);

    },

    /**
     * Collects routes rules for nodes
     * @param node {Object} - single node of sitemap model
     * @param level {Number} - menu deep level
     */
    processRoute: function(routes) {
        this.params = _.extend({}, this.parent.params);

        if(!this.route) {
            this.route = {
                name: this.parent.route.name
            };
            this.type = this.type || (this.url ? this.TYPE.SIMPLE : this.TYPE.GROUP);
            return this;
        }

        //BEMINFO-195
        if(_.isString(this.route)) {
            this.route = {
                conditions: {
                    id: this.route
                }
            };
        }

        var r = this.route;

        if(r[constants.ROUTE.NAME]) {
            routes[r.name] = routes[r.name] || { name: r.name, pattern: r.pattern };
            this.url = susanin.Route(routes[r.name]).build(this.params);
        }else {
            r.name = this.parent.route.name;
        }

        [
            constants.ROUTE.DEFAULTS,
            constants.ROUTE.CONDITIONS,
            constants.ROUTE.DATA
        ].forEach(function(item) {
                routes[r.name][item] = routes[r.name][item] || {};

                if(r[item]) {
                    Object.keys(r[item]).forEach(function(key) {
                        if(item === constants.ROUTE.CONDITIONS) {
                            routes[r.name][item][key] = routes[r.name][item][key] || [];
                            routes[r.name][item][key] = routes[r.name][item][key].concat(r[item][key]);
                            this.url = susanin.Route(routes[r.name]).build(_.extend(this.params, r[item]));
                        }else {
                            routes[r.name][item][key] = r[item][key];
                        }
                    }, this);
                }
            }, this);

        this.type = this.type || this.TYPE.SIMPLE;
        return this;
    },

    /**
     * Sets params for indexation by search engines
     * @returns {BaseNode}
     */
    setSearch: function() {
        var def = this.SITEMAP_XML.DEFAULT;

        if(!this.search) {
            this.search = def;
            return this;
        }

        //validate settled changefreq property
        if(!this.search.changefreq ||
            this.SITEMAP_XML.FREQUENCIES.indexOf(this.search.changefreq) === -1) {
            this.search.changefreq = def.changefreq;
        }

        //validate settled priority property
        if(!this.search.priority || this.search.priority < 0 || this.search.priority > 1) {
            this.search.priority = def.priority;
        }

        return this;
    }
};

exports.BaseNode = BaseNode;
