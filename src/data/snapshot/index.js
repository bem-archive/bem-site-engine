var vow = require('vow'),
    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module),
    nodes = require('../model');

function getSitemap(modelPath) {
    logger.info('Get sitemap start');

    try {
        return vow.resolve(require(modelPath).get());
    }catch(err) {
        logger.error('Can not resolve valid sitemap js model');
        return vow.reject(err.message);
    }
}

function analyze(sitemap) {
    logger.info('analyze sitemap start');

    var def = vow.defer(),
        routes = {},
        traverseTreeNodes = function(node, parent) {
            node = new nodes.base.BaseNode(node, parent);
            node.processRoute(routes).createBreadcrumbs();

            if(node.items) {
                node.items = node.items.map(function(item) {
                    return traverseTreeNodes(item, node);
                });
            }

            return node;
        };

    try {
        def.resolve({
            routes: routes,
            sitemap: sitemap.map(function(item) {
                return traverseTreeNodes(item, {
                    level: -1,
                    route: { name: null },
                    params: {}
                });
            })
        });

        logger.info('sitemap object has been analyzed successfully');
    } catch(e) {
        logger.error('Error occur while analyze sitemap object');
        def.reject(e);
    }

    return def.promise();
}

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath) {
        logger.info('create snapshot start');

        return getSitemap(modelPath)
            .then(analyze)
            .then(require('./load_sources'))
            .then(require('./load_people'))
            .then(require('./add_dynamic_nodes'))
            .then(require('./add_library_nodes'))
            .then(require('./override_links.js'))
            .then(require('./generate_sitemap'))
            .then(require('./save_and_upload'))
            .then(function() {
                logger.info('snapshot was created successfully');
                return vow.resolve();
            })
            .fail(function() {
                logger.error('Error occur while compile models and loading documentation');
                return vow.reject();
            });
    }
};


