vow = require('vow'),
    _ = require('lodash'),
    logger = require('../logger')(module);

var routes = {};

exports.init = function(sitemap) {
    logger.debug('Generate application routes');

    var def = vow.defer(),
        nodeR = function(node, parent) {

            if(_.has(node, 'route') && _.isObject(node.route)) {
                if(_.has(node.route, 'name')) {
                    routes[node.route.name] = node.route;
                }else {
                    node.route.name = parent.route.name;

                    var r = node.route;

                    if(_.has(r, 'conditions')) {
                        routes[node.route.name]['conditions'] =
                            routes[node.route.name]['conditions'] || {};

                        _.keys(r.conditions).forEach(function(key) {
                            routes[node.route.name].conditions[key] =
                                routes[node.route.name].conditions[key] || [];

                            routes[node.route.name].conditions[key].push(r.conditions[key]);
                        });
                    }
                }
            }else {
                node.route = parent.route;
            }

            if(_.has(node, 'items')) {
                node.items.forEach(function(item) {
                    nodeR(item, node);
                });
            }
        };


    try{
        sitemap.forEach(function(item) {
            nodeR(item, {route: {name: null}});
        });

        def.resolve(sitemap);
    }catch(e) {
        logger.error(e);
        def.reject(e.message);
    }

    return def.promise();
};

exports.getNode = function(url) {
    //TODO implement this
}
