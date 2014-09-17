var _ = require('lodash'),
    vow = require('vow'),

    logger = require('..logger')(module),
    util  = require('../util'),
    nodes = require('../model');

/**
 * Dynamically build tree of child nodes for each library
 * @param routes - {Object} application routes hash
 * @param nodesWithLibs - {Array} array of target library nodes
 * @param libraries - {Object} loaded libs data
 * @returns {{search: *, blocksHash: *}}
 */
function addLibraryNodes(routes, nodesWithLibs, libraries) {

    var search = {
            libraries: {},
            blocks: []
        },
        blocksHash = {};

    nodesWithLibs.forEach(function(node) {
        logger.debug('add versions to library %s %s', node.lib, node.url);

        var versions = libraries[node.lib];
        if(!versions) return;

        Object.keys(versions)
            .sort(util.sortLibraryVerions)
            .forEach(function(key, index) {
                node.items = node.items || [];
                node.items.push(
                    new nodes.version.VersionNode(node, routes, versions[key], search, blocksHash, index));
            });
    });

    search.libraries = _.values(search.libraries);
    return { search: search, blocksHash: blocksHash };
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
            var result = addLibraryNodes(routes, nodes, libraries);
            obj.search = result.search;
            obj.blocksHash = result.blocksHash;
            return vow.resolve(obj);
        });
};

