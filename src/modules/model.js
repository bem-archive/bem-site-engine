var vow = require('vow'),
    _ = require('lodash'),

    nodes = require('./nodes'),
    logger = require('../logger')(module),
    config = require('../config'),
    data = require('./data');

var sitemap,
    routes,
    authors,
    translators,
    tags,
    tagUrls,
    people,
    peopleUrls;

module.exports = {
    init: function(worker) {

        logger.info('Init site structure and load data for worker %s', worker.wid);

        data.common.init();

        var promise;

        if('development' === config.get('NODE_ENV')) {
            promise = data.common.loadData(data.common.PROVIDER_FILE, {
                path: config.get('data:data')
            });
        }else {
            promise = data.common.loadData(data.common.PROVIDER_YANDEX_DISK, {
                path: config.get('data:data')
            }).then(function(content) {
                try {
                    return JSON.parse(content);
                }catch(err) {
                    logger.error('Error occur while parsing data object');
                }
            });
        }

        return promise.then(function(content) {
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

var addCircularReferences = function(tree) {
    var traverseTreeNodes = function(node, parent) {
        node = new nodes.runtime.RuntimeNode(node, parent);

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