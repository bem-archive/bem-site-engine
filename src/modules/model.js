var p = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    nodes = require('./node'),
    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),
    provider = require('./providers');

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
     * Loads data model from local filesystem or yandex Disk depending on environment
     * and fills the model
     * @param worker - {Object} worker object
     * @returns {*}
     */
    init: function(worker) {

        logger.info('Init site structure and load data for worker %s', worker.wid);
        logger.debug('Enviroment: %s', config.get('NODE_ENV'));
        logger.debug('Path to data file: %s', p.join(config.get('common:model:dir'), config.get('NODE_ENV'), config.get('common:model:data')));

        provider.init();

        var promise = provider.load(util.isDev() ? provider.PROVIDER_FILE : provider.PROVIDER_DISK, {
                path: p.join(config.get('common:model:dir'),
                    util.isDev() ? '' : config.get('NODE_ENV'), config.get('common:model:data'))
            });

        return promise
            .then(function(content) {
                try {
                    return JSON.parse(content);
                }catch(err) {
                    logger.error('Error occur while parsing data object');
                }
            })
            .then(function(content) {
                logger.debug('Start filling the application model');
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

                    logger.debug('Model has been filled successfully');
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
        node = new nodes.Node(node, parent);

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
