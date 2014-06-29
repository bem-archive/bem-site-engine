var vow = require('vow'),

    logger = require('../lib/logger')(module),
    nodes = require('../model');

var routes = {};

module.exports = function(sitemap) {
    logger.info('analyze sitemap start');

    var def = vow.defer();

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
};

/**
 * Recursive function for traversing tree model
 * @param node {Object} - single node of sitemap model
 * @param parent {Object} - parent for current node
 */
var traverseTreeNodes = function(node, parent) {
    node = new nodes.base.BaseNode(node, parent);
    node.processRoute(routes).createBreadcrumbs();

    logger.verbose('node: id = %s level = %s url = %s', node.id, node.level, node.url);

    //deep into node items
    if(node.items) {
        node.items = node.items.map(function(item) {
            return traverseTreeNodes(item, node);
        });
    }

    return node;
};
