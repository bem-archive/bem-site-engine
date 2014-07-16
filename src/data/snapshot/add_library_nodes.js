var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    util  = require('../lib/util'),
    nodes = require('../model');

/**
 * Dynamically build tree of child nodes for each library
 * @param routes - {Object} application routes hash
 * @param nodesWithLib - {Array} array of target library nodes
 * @param libraries - {Object} loaded libs data
 * @returns {{libraries: *, blocks: Array}}
 */
function addLibraryNodes(routes, nodesWithLib, libraries) {

    var searchLibraries = {},
        searchBlocks = [];

    nodesWithLib.forEach(function(node) {
        logger.debug('add versions to library %s %s', node.lib, node.url);

        var versions = libraries[node.lib];
        if(!versions) return;

        Object.keys(versions)
            .sort(util.sortLibraryVerions)
            .forEach(function(key, index) {
                node.items = node.items || [];
                node.items.push(
                    new nodes.version.VersionNode(node, routes, versions[key], searchLibraries, searchBlocks, index));
            });
    });

    addVersionAliases(routes);

    return {
        libraries: _.values(searchLibraries),
        blocks: searchBlocks
    };
}

/**
 * Add allowed aliases for library versions
 * such as current or v{n}.x
 * @param routes - {Object} application routes hash
 */
function addVersionAliases(routes) {
    Object.keys(routes).forEach(function(key) {
        var conditions = routes[key].conditions;

        if(conditions) {
            if(conditions.version) {
                conditions.version.push('current');
                for(var i = 1; i < 100; i++) {
                    conditions.version.push(u.format('v%s.x', i));
                }
            }
            if(conditions.id) {
                conditions.id = conditions.id.concat(['docs', 'jsdoc', 'examples']);
            }
        }

        routes[key].conditions = conditions;
    });
}

module.exports = function(obj) {
    var routes = obj.routes,
        nodes = util.findNodesByCriteria(obj.sitemap, function() { return this.lib; }, false);

    logger.info('add library nodes start');

    if(!nodes || !_.isArray(nodes) || !nodes.length) {
        logger.warn('nodes with lib not found');

        obj.search = {
            libraries: {},
            blocks: []
        };

        return vow.resolve(obj);
    }

    return require('./load_libraries')(nodes)
        .then(function(libraries) {
            obj.search = addLibraryNodes(routes, nodes, libraries);
            return vow.resolve(obj);
        });
};

