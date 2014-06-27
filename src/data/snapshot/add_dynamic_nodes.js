var _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    util = require('../lib/util'),
    constants = require('../lib/constants'),
    nodes = require('../model');

module.exports = function(obj) {
    logger.info('Add dynamic nodes to sitemap start');

    var urls = {
        people: {},
        tags: {}
    };

    return vow
        .all([
            addDynamicNodesFor({
                key: 'tags:en',
                data: obj.docs.tags.en,
                urlHash: urls.tags
            }, obj),
            addDynamicNodesFor({
                key: 'tags:ru',
                data: obj.docs.tags.ru,
                urlHash: urls.tags
            }, obj),
            addDynamicNodesFor({
                key: 'authors',
                data: obj.docs.authors,
                urlHash: urls.people,
                people: obj.people
            }, obj),
            addDynamicNodesFor({
                key: 'translators',
                data: obj.docs.translators,
                urlHash: urls.people,
                people: obj.people
            }, obj)
        ])
        .then(function() {
            obj.dynamic = urls;
            return obj;
        });
};

var addDynamicNodesFor = function(config, obj) {
    logger.debug('add dynamic nodes for %s', config.key);

    var targetNode,
        baseRoute,
        def = vow.defer(),
        routes = obj.routes;

    try {
        targetNode = util.findNodeByCriteria(obj.sitemap, 'dynamic', config.key);

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

            if('authors' === config.key) {
                _node = new nodes.person.PersonNode(_route, targetNode, item, config.people);
            }else if('translators' === config.key) {
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
