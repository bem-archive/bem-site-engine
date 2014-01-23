var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),
    leData = require('./le-data');

var sitemap,
    routes = {};

module.exports = {
    run: function() {
        logger.info('Init site structure and load data');

        leData.init();

        return load()
            .then(parse)
            .then(process)
            .then(leData.loadAll)
    },

    getRoutes: function() {
        return _.values(routes);
    },

    getSitemap: function() {
        return sitemap;
    }
};

var load = function() {
    logger.debug('Load site map');

    return fs
        .read(path.join('configs', 'common', 'sitemap.json'), 'utf-8')
        .fail(
        function(err) {
            logger.error('Site map loading failed with error %s', err.message);
        }
    );
};

var parse = function(data) {
    logger.debug('Parse site map');

    var def = vow.defer();

    try {
        sitemap = JSON.parse(data);
        def.resolve(sitemap);
    } catch(err) {
        logger.error('Site map parsed with error %s', err.message);
        def.reject(err);
    }

    return def.promise();
};

var process = function(sitemap) {
    logger.debug('Process site map');

    var def = vow.defer(),
        idSourceMap = {},
        nodeR = function(node, parent) {

            node.id = sha(JSON.stringify(node));
            node.parent = parent;

            if(_.has(node, 'route') && _.isObject(node.route)) {
                var r = node.route;

                if(_.has(r, 'name')) {
                    routes[r.name] = routes[r.name] || { name: r.name, pattern: r.pattern };
                }else {
                    r.name = parent.route.name;
                    //r.pattern = parent.route.pattern;
                }

                ['defaults', 'conditions', 'data'].forEach(function(item) {
                    routes[r.name][item] = routes[r.name][item] || {};

                    if(_.has(r, item)) {
                        _.keys(r[item]).forEach(function(key) {
                            if(item === 'conditions') {
                                routes[r.name][item][key] = routes[r.name][item][key] || [];
                                routes[r.name][item][key].push(r[item][key]);

                                //r[item] = _.extend(r[item], parent.route[item]);
                            }else {
                                routes[r.name][item][key] = r[item][key];
                            }
                        });
                    }
                });

            }else {
                node.route = {name: parent.route.name};
            }

            //make title consistent
            if(_.has(node, 'title')) {
                if(_.isString(node.title)) {
                    node.title = {
                        en: node.title,
                        ru: node.title
                    }
                }
            }

            //create hash unique id of node -> source
            if(_.has(node, 'source')) {
                idSourceMap[node.id] = node.source;
            }

            //deep into node items
            if(_.has(node, 'items')) {
                node.items.forEach(function(item) {
                    nodeR(item, node);
                });
            }
        };

    try {
        sitemap.forEach(function(item) {
            nodeR(item, {route: {name: null}});
        });

        leData.setIdHash(idSourceMap);
        def.resolve(sitemap);
    } catch(e) {
        logger.error(e.message);
        def.reject(e);
    }

    return def.promise();
};
