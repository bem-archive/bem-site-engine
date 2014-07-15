var u = require('util'),
    _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    util  = require('../lib/util'),
    constants = require('../lib/constants'),
    nodes = require('../model');


function addLibraryNodes(routes, nodesWithLib, libraries) {

    var searchLibraries = {},
        searchBlocks = [];

    nodesWithLib.forEach(function(node) {
        logger.debug('add versions to library %s %s', node.lib, node.url);

        var versions = libraries[node.lib];
        if(!versions) return;

        Object.keys(versions).sort(util.sortLibraryVerions).forEach(function(key, index) {
            node.items.push(
                new nodes.version.VersionNode(node, versions[key], searchLibraries, searchBlocks, index));
        });
    });

    //add current version value for route version conditions
    Object.keys(routes).forEach(function(key) {
        var conditions = routes[key].conditions;

        if(conditions) {
            //add version aliases
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

    return {
        libraries: _.values(searchLibraries),
        blocks: searchBlocks
    };
}

module.exports = function(obj) {
    var routes = obj.routes,
        nodes = util.findNodesByCriteria(obj.sitemap, function() {
            return this.lib;
        }, false);

    logger.info('add library nodes start');

    if(!nodes || !_.isArray(nodes) || !nodes.length) {
        logger.warn('nodes with lib not found');

        obj.search = {
            libraries: {},
            blocks: []
        };

        return vow.resolve(obj);
    }

    return require('./load_libraries')(nodes).then(function(libraries) {
        obj.search = addLibraryNodes(routes, nodes, libraries);
        return vow.resolve(obj);
    });
};

