var path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    util = require('util'),
    config = require('config'),
    logger = require('logger')(module),
    providers = require('./providers');

var sitemap,
    routes,
    authors,
    translators,
    tags,
    tagUrls,
    people,
    peopleUrls;

module.exports = {

    /**
     * Loads data model from local filesystem or yandex Disk depending on environment and fills the model
     * @returns {*}
     */
    init: function() {

        providers.init();

        var provider = util.isDev() ? providers.getFileProvider() : providers.getYaDiskProvider(),
            opts = { path: path.join(config.get('common:model:dir'),
                    util.isDev() ? '' : config.get('NODE_ENV'), config.get('common:model:data'))
            };

        return provider.load(opts)
            .then(function(content) {
                try {
                    return JSON.parse(content);
                }catch(err) {
                    logger.error('Error occur while parsing data object');
                }
            })
            .then(function(content) {
                try {
                    sitemap = addCircularReferences(content.sitemap);
                    routes = _.values(content.routes);

                    if (content.docs) {
                        authors = content.docs.authors;
                        translators = content.docs.translators;
                        tags = content.docs.tags;
                    }

                    people = content.people;

                    peopleUrls = content.urls.people;
                    tagUrls = content.urls.tags;

                }catch(err) {
                    logger.error('Error occur while filling model');
                }
            });
    },

    /**
     * Returns array of objects for susanin routes creation
     * @returns {Array}
     */
    getRoutes: function() {
        return routes;
    },

    /**
     * Returns parsed and post-processed sitemap model
     * @returns {Object}
     */
    getSitemap: function() {
        return sitemap;
    },

    /**
     * Returns array of collected authors from docs meta-information without duplicates
     * @returns {Array}
     */
    getAuthors: function() {
        return authors;
    },

    /**
     * Returns array of collected translators from docs meta-information without duplicates
     * @returns {Array}
     */
    getTranslators: function() {
        return translators;
    },

    /**
     * Returns array of collected tags from docs meta-information without duplicates
     * @returns {Array}
     */
    getTags: function() {
        return tags;
    },

    /**
     * Returns tag urls
     * @returns {Object}
     */
    getTagUrls: function() {
        return tagUrls;
    },

    /**
     * Returns people hash
     * @returns {Object}
     */
    getPeople: function() {
        return people;
    },

    /**
     * Returns people urls
     * @returns {Object}
     */
    getPeopleUrls: function() {
        return peopleUrls;
    }
};

/**
 * Restore circular references between nodes and their parents
 * @param tree - {Object} model tree object
 * @returns {Object} modified tree object
 */
var addCircularReferences = function(tree) {
    var traverseTreeNodes = function(node, parent) {
        node = new Node(node, parent);

        if(node.items) {
            node.items = node.items.map(function(item) {
                return traverseTreeNodes(item, node);
            });
        }

        return node;
    };

    return tree.map(function(item) {
        return traverseTreeNodes(item, null);
    });
};

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
