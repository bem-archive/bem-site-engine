var path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    util = require('./util'),
    config = require('./config'),
    logger = require('./logger')(module),
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
     * Returns array of pseudo-nodes with title attribute
     * and pseudo-node items with id and url attributes which
     * is necessary to build posts block
     * @param lang - {String} lang
     * @param field - {Array|String} array or string with criteria source field
     * @param value - {Array|String} array or string with search value
     * @returns {Array}
     */
    getNodesBySourceCriteria : function(lang, field, value) {
        logger.debug('get nodes by criteria start %s %s %s', lang, field, value);

        var result = {},
            traverseTreeNodes = function(node) {
                if(node.route.pattern) {
                    result[node.route.name] = {
                        title: node.title[lang]
                    };
                }

                if(node.source && node.view !== node.VIEW.TAGS) {
                    result[node.route.name].items = result[node.route.name].items || [];

                    if(criteria(node.source[lang], field, value)) {
                        result[node.route.name].items.push(node);
                    }
                }

                if(node.items) {
                    node.items.forEach(function(item) {
                        traverseTreeNodes(item);
                    });
                }
            };

        sitemap.forEach(function(node) {
            traverseTreeNodes(node);
        });

        return _.values(result).filter(function(item) {
            return item.items && item.items.length > 0;
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
 * Returns true if value of field of data is equal to value
 * @param data - {Object} data  object
 * @param field - {Array || String} name of field or array of fields
 * @param value - {Array || String} value or array of values
 * @returns {boolean} - Boolean result
 */
var criteria = function(data, field, value) {
    if(!data) {
        return false;
    }

    if(_.isUndefined(value) || _.isNull(value)) {
        return true;
    }

    if(_.isArray(field) && _.isArray(value)) {
        return field.filter(function(f) {
            if(_.isArray(data[f])) {
                return _.intersection(data[f], value).length > 0;
            }else {
                return value.indexOf(data[f]) !== -1;
            }
        }).length > 0;
    } else if(_.isArray(field)) {
        return field.filter(function(f) {
            if(_.isArray(data[f])) {
                return data[f].indexOf(value) !== -1;
            }else {
                return data[f] === value;
            }
        }).length > 0;
    } else if(_.isArray(value)) {
        if(_.isArray(data[field])) {
            return _.intersection(data[field], value).length > 0;
        }else {
            return value.indexOf(data[field]) !== -1;
        }
    } else {
        if(_.isArray(data[field])) {
            return data[field].indexOf(value) !== -1;
        }else {
            return data[field] === value;
        }
    }
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
