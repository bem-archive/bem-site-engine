var path = require('path'),
    vow = require('vow'),

    logger = require('../logger'),
    nodes = require('../model');

function analyze() {
    logger.info('analyze model start', module);

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
        var map = require(path.join(process.cwd(), 'model/index.js')).get();
        def.resolve({
            routes: routes,
            sitemap: map.map(function(item) {
                return traverseTreeNodes(item, {
                    level: -1,
                    route: { name: null },
                    params: {}
                });
            })
        });
        logger.info('Sitemap object has been analyzed successfully', module);
    } catch(e) {
        logger.error('Error occur while analyze sitemap object', module);
        def.reject(e);
    }
    return def.promise();
}

module.exports = function() {
    logger.info('Create snapshot start', module);

    return analyze()
        .then(require('./load-sources'))
        .then(require('./load_people'))
        .then(require('./add_dynamic_nodes'))
        .then(require('./add_library_nodes'))
        .then(require('./override-links'))
        .then(require('./sitemapXML'))
        .then(require('./save'))
        .then(function(snapshot) {
            logger.info('Snapshot was created successfully', module);
            return vow.resolve(snapshot);
        })
        .fail(function(err) {
            logger.error('Error occur while compile models and loading documentation', module);
            return vow.reject(err);
        });
};
