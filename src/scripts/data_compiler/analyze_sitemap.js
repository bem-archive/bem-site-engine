var _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../../logger')(module),
    constants = require('../../modules/constants'),
    nodes = require('../../modules/nodes');

var MSG = {
    INFO: {
        START: 'analyze sitemap start',
        SUCCESS: 'sitemap object has been analyzed successfully'
    },
    ERROR: 'Error occur while analyze sitemap object'
};

var routes = {},
    sourceNodes = [],
    libraryNodes = [];

module.exports = {
    run: function(sitemap) {
        logger.info(MSG.INFO.START);

        var def = vow.defer();

        try {
            def.resolve({
                sourceNodes: sourceNodes,
                libraryNodes: libraryNodes,
                routes: routes,
                sitemap: sitemap.map(function(item) {
                    return traverseTreeNodes(item, {
                        level: -1,
                        route: { name: null },
                        params: {}
                    });
                })
            });

            logger.info(MSG.INFO.SUCCESS);
        } catch(e) {
            logger.error(MSG.ERROR);
            def.reject(e);
        }

        return def.promise();
    }
};

/**
 * Recursive function for traversing tree model
 * @param node {Object} - single node of sitemap model
 * @param parent {Object} - parent for current node
 */
var traverseTreeNodes = function(node, parent) {
    node = new nodes.base.BaseNode(node, parent);

    processRoute(node).createBreadcrumbs();

    node.source && sourceNodes.push(node);
    node.lib && libraryNodes.push(node);

    logger.verbose('node: id = %s level = %s url = %s', node.id, node.level, node.url);

    //deep into node items
    if(node.items) {
        node.items = node.items.map(function(item) {
            return traverseTreeNodes(item, node);
        });
    }

    return node;
};

/**
 * Collects routes rules for nodes
 * @param node {Object} - single node of sitemap model
 * @param level {Number} - menu deep level
 */
var processRoute = function(node) {
    node.params = _.extend({}, node.parent.params);

    if(!node.route) {
        node.route = {
            name: node.parent.route.name
        };
        node.type = node.type || (node.url ? node.TYPE.SIMPLE : node.TYPE.GROUP);
        return node;
    }

    var r = node.route;

    if(r[constants.ROUTE.NAME]) {
        routes[r.name] = routes[r.name] || { name: r.name, pattern: r.pattern };
        node.url = susanin.Route(routes[r.name]).build(node.params);
    }else {
        r.name = node.parent.route.name;
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
                    routes[r.name][item][key].push(r[item][key]);
                    node.url = susanin.Route(routes[r.name]).build(_.extend(node.params, r[item]));
                }else {
                    routes[r.name][item][key] = r[item][key];
                }
            });
        }
    });

    node.type = node.type || node.TYPE.SIMPLE;
    return node;
};
