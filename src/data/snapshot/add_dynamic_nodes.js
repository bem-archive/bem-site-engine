var _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    constants = require('../lib/constants'),
    nodes = require('../model');

module.exports = function(sitemap, routes, docs, people) {
    logger.info('Add dynamic nodes to sitemap start');

    var urls = {
        people: {},
        tags: {}
    };

    return vow
        .all([
            addDynamicNodesFor({ key: 'authors', data: docs.authors, urlHash: urls.people, people: people }, sitemap, routes),
            addDynamicNodesFor({ key: 'translators', data: docs.translators, urlHash: urls.people, people: people }, sitemap, routes),
            addDynamicNodesFor({ key: 'tags:en', data: docs.tags.en, urlHash: urls.tags }, sitemap, routes),
            addDynamicNodesFor({ key: 'tags:ru', data: docs.tags.ru, urlHash: urls.tags }, sitemap, routes)
        ])
        .then(function() {
            return urls;
        });
};

var addDynamicNodesFor = function(config, sitemap, routes) {
    logger.debug('add dynamic nodes for %s', config.key);

    var def = vow.defer(),
        targetNode,
        baseRoute;

    try {
        targetNode = findNodeByCriteria(sitemap, 'dynamic', config.key);

        if(!targetNode) {
            logger.warn('target node for %s was not found', config.key);

            def.resolve();
            return def.promise();
        }

        baseRoute = targetNode.getBaseRoute();

        targetNode.items = targetNode.items || [];
        routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

        config.data.forEach(function(item) {
            var conditions = {
                conditions: {
                    id: item
                }
            };

            Object.keys(conditions.conditions).forEach(function(key) {
                routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
                routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
            });

            var _node,
                _route = {
                    route: _.extend({}, { name: baseRoute.name }, conditions),
                    url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                };

            if('authors' === config.key || 'translators' === config.key) {
                _node = new nodes.person.PersonNode(_route, targetNode, item, config.people);
            }else if( config.key.indexOf('tags') > -1) {
                _node = new nodes.tag.TagNode(_route, targetNode, item);
            }

            config.urlHash[item] = _node.url;
            targetNode.items.push(_node);

            logger.verbose('add dynamic node for %s with id = %s level = %s url = %s',
                config.key, _node.id, _node.level, _node.url);

            def.resolve(_node);
        });
    }catch(err) {
        logger.error(err.message);
        def.reject(err);
    }

    return def.promise();
};

/**
 * Finds node by attribute and its value
 * @param sitemap - {Object} sitemap model object
 * @param field - {Stirng} name of attribute
 * @param value - {String} value of attribute
 * @returns {Object} node
 */
var findNodeByCriteria = function(sitemap, field, value) {

    var result = null,
        traverseTreeNodes = function(node) {
            if(node[field] && node[field] === value) {
                result = node;
            }

            if(!result && node.items) {
                node.items.forEach(function(item) {
                    traverseTreeNodes(item);
                });
            }
        };

    sitemap.forEach(function(node) {
        if(result) {
            return;
        }
        traverseTreeNodes(node);
    });

    return result;
};
