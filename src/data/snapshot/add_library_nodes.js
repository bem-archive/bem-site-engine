var u = require('util'),
    _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    util  = require('../lib/util'),
    constants = require('../lib/constants'),
    nodes = require('../model');

module.exports = function(sitemap, routes, nodesWithLib, libraries) {
    logger.info('add library nodes start');

    var def = vow.defer(),
        searchLibraries = {},
        searchBlocks = [];

    if(!nodesWithLib || !_.isArray(nodesWithLib) || nodesWithLib.length === 0) {
        logger.warn('nodes with lib not found');

        def.resolve({
            libraries: searchLibraries,
            blocks: searchBlocks
        });

        return def.promise();
    }

    var collectConditionsForBaseRoute = function(baseRoute, conditions) {
            Object.keys(conditions.conditions).forEach(function(key) {
                routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
                routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
                routes[baseRoute.name].conditions[key] = _.uniq(routes[baseRoute.name].conditions[key]);
            });
        },

        /**
         *
         * @param targetNode
         */
        addVersionsToLibrary = function(targetNode) {
            logger.debug('add versions to library %s %s', targetNode.lib, targetNode.url);

            var baseRoute = targetNode.getBaseRoute();

            routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
            targetNode.items = targetNode.items || [];

            var versions = libraries[targetNode.lib];
            if(!versions) return;

            Object.keys(versions).sort(util.sortLibraryVerions).forEach(function(key, index) {

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

                //search libraries model
                searchLibraries[version.repo] =
                    searchLibraries[version.repo] || new nodes.search.Library(version.repo);

                searchLibraries[version.repo].addVersion(
                    new nodes.search.Version(version.ref, _route.url, _node.source.ru.content, !index));
                //

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

        /**
         *
         * @param targetNode
         * @param version
         * @param _config
         */
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

        /**
         *
         * @param targetNode
         * @param version
         */
        addLevelsToVersion = function(targetNode, version) {

            var baseRoute = targetNode.getBaseRoute();

            routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};
            targetNode.items = targetNode.items || [];

            var levels = version.levels;
            if(!levels) return;

            levels.forEach(function(level) {
                level.name = level.name.replace(/\.(sets|docs)$/, '');

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

                    //add library block level to library search item
                    _.find(searchLibraries, function(item) { return version.repo === item.name; })
                        .getVersion(version.ref).addLevel(new nodes.search.Level(level.name));

                    targetNode.items.push(_node);

                    addBlocksToLevel(_node, version, level);
                }
            });
        },

        /**
         *
         * @param targetNode
         * @param version
         * @param level
         */
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

                //add library block to library search item
                _.find(searchLibraries, function(item) { return version.repo === item.name; })
                    .getVersion(version.ref).getLevel(level.name).addBlock(block.name);

                logger.verbose('add block %s to level %s of version %s', block.name, level.name, version.ref);

                collectConditionsForBaseRoute(baseRoute, conditions);

                //create node
                var _route = {
                        route: _.extend({}, { name: baseRoute.name }, conditions),
                        url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions)
                    },
                    _node = new nodes.block.BlockNode(_route, targetNode, block);

                var examplePrefix = version.enb ?
                    u.format('/__example/%s/%s', version.repo, version.ref) :
                    u.format('/__example/%s/%s/%s/%s', version.repo, version.ref, level.name, block.name);

                _node.setSource({
                    prefix: examplePrefix,
                    data: block.data,
                    jsdoc: block.jsdoc
                });

                searchBlocks.push(
                    new nodes.search.Block(block.name, _route.url, version.repo,
                        version.ref, level.name, block.data, block.jsdoc));

                targetNode.items.push(_node);
            });
        };

    nodesWithLib.forEach(function(node) {
        addVersionsToLibrary(node);
    });

    //add current version value for route version conditions
    Object.keys(routes).forEach(function(key) {
        var conditions = routes[key].conditions;

        if(conditions && conditions.version) {
            conditions.version.push('current');
        }
        if(conditions && conditions.id) {
            conditions.id = conditions.id.concat(['docs', 'jsdoc', 'examples']);
        }

        routes[key].conditions = conditions;
    });

    def.resolve({
        libraries: _.values(searchLibraries),
        blocks: searchBlocks
    });

    return def.promise();
};

