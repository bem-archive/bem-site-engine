var _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    constants = require('../lib/constants'),
    nodes = require('../model');

var routes = {},
    sourceRouteHash = {},
    sourceNodes = [],
    libraryNodes = [];

module.exports = function(sitemap) {
    logger.info('analyze sitemap start');

    var def = vow.defer();

    try {
        def.resolve({
            sourceNodes: sourceNodes,
            libraryNodes: libraryNodes,
            sourceRouteHash: sourceRouteHash,
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

    //BEMINFO-195
    if(_.isString(node.route)) {
        node.route = {
            conditions: {
                id: node.route
            }
        };
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
                    routes[r.name][item][key] = routes[r.name][item][key].concat(r[item][key]);
                    node.url = susanin.Route(routes[r.name]).build(_.extend(node.params, r[item]));
                }else {
                    routes[r.name][item][key] = r[item][key];
                }
            });
        }
    });

    if(node.url && node.source) {
        config.get('common:languages').forEach(function(lang) {
            if(node.source[lang] && node.source[lang].content) {
                sourceRouteHash[node.source[lang].content] = node.url;
            }
        });
    }

    node.type = node.type || node.TYPE.SIMPLE;
    return node;
};
