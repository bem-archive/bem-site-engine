var u = require('util'),
    _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../../logger')(module),
    constants = require('../../modules/constants'),
    util  = require('../../util'),
    nodes = require('../../modules/nodes');

module.exports = {
    run: function(sitemap, routes, nodesWithLib, libraries) {
        logger.info('add library nodes start');

        if(!nodesWithLib || !_.isArray(nodesWithLib) || nodesWithLib.length === 0) {
            logger.warn('nodes with lib not found');
            return;
        }

        var collectConditionsForBaseRoute = function(baseRoute, conditions) {
                Object.keys(conditions.conditions).forEach(function(key) {
                    routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
                    routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
                    routes[baseRoute.name].conditions[key] = _.uniq(routes[baseRoute.name].conditions[key]);
                });
            },

            addVersionsToLibrary = function(targetNode) {
                logger.verbose('add versions to library %s', targetNode.lib);

                var baseRoute = targetNode.getBaseRoute();

                routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
                targetNode.items = targetNode.items || [];

                var versions = libraries[targetNode.lib];
                if(!versions) return;

                Object.keys(versions).sort(util.sortLibraryVerions).forEach(function(key) {

                    var version = versions[key],
                        conditions = {
                            conditions: {
                                lib: version.repo,
                                version: version.ref
                            }
                        };

                    collectConditionsForBaseRoute(baseRoute, conditions);

                    //create node
                    var _route = {
                            route: _.extend({}, { name: baseRoute.name }, conditions),
                            url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                        },
                        _node = new nodes.version.VersionNode(_route, targetNode, version);

                    targetNode.items.push(_node);

                    addPostToVersion(_node, version, {
                        key: 'migration',
                        title: {
                            en: 'Migration',
                            ru: 'Migration'
                        }
                    });

                    addPostToVersion(_node, version, {
                        key: 'changelog',
                        title: {
                            en: 'Changelog',
                            ru: 'Changelog'
                        }
                    });

                    addLevelsToVersion(_node, version);
                });
            },

            addPostToVersion = function(targetNode, version, _config) {
                logger.verbose('add post %s to version %s of library %s', _config.key, version.ref, version.repo);

                var baseRoute = targetNode.getBaseRoute();

                routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
                targetNode.items = targetNode.items || [];

                var conditions = {
                    conditions: {
                        lib: version.repo,
                        version: version.ref,
                        id: _config.key
                    }
                };

                //verify existed docs
                if(!version[_config.key]) {
                    return;
                }

                collectConditionsForBaseRoute(baseRoute, conditions);

                //create node
                var _route = {
                        route: _.extend({}, { name: baseRoute.name }, conditions),
                        url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                    },
                    _node = new nodes.post.PostNode(_route, targetNode, version, _config);

                targetNode.items.push(_node);
            },

            addLevelsToVersion = function(targetNode, version) {

                var baseRoute = targetNode.getBaseRoute();

                routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
                targetNode.items = targetNode.items || [];

                var levels = version.levels;
                if(!levels) return;

                levels.forEach(function(level) {
                    var conditions = {
                        conditions: {
                            lib: version.repo,
                            version: version.ref,
                            level: level.name
                        }
                    };

                    //verify existed blocks for level
                    if(level.blocks) {
                        collectConditionsForBaseRoute(baseRoute, conditions);

                        //create node
                        var _route = {
                                route: _.extend({}, { name: baseRoute.name }, conditions),
                                url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                            },
                            _node = new nodes.level.LevelNode(_route, targetNode, level);

                        targetNode.items.push(_node);

                        addBlocksToLevel(_node, version, level);
                    }
                });
            },

            addBlocksToLevel = function(targetNode, version, level) {
                logger.verbose('add blocks to level %s of version %s', level.name, version.ref);

                var baseRoute = targetNode.getBaseRoute();

                routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
                targetNode.items = targetNode.items || [];

                var blocks = level.blocks;
                if(!blocks) return;

                blocks.forEach(function(block) {
                    var conditions = {
                        conditions: {
                            lib: version.repo,
                            version: version.ref,
                            level: level.name,
                            block: block.name
                        }
                    };

                    logger.verbose('add block %s to level %s of version %s', block.name, level.name, version.ref);

                    collectConditionsForBaseRoute(baseRoute, conditions);

                    //create node
                    var _route = {
                            route: _.extend({}, { name: baseRoute.name }, conditions),
                            url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                        },
                        _node = new nodes.block.BlockNode(_route, targetNode, block);

                    _node.setSource({
                        prefix: u.format('/__example/%s/%s/%s/%s',
                            version.repo, version.ref, level.name, block.name),
                        data: block.data,
                        jsdoc: block.jsdoc
                    });

                    targetNode.items.push(_node);
                });
            };

        nodesWithLib.forEach(function(node) {
            addVersionsToLibrary(node);
        });
    }
};
