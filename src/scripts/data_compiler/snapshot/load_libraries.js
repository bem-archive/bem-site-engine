var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

module.exports = {

    run: function(libraryNodes) {
        logger.info('Load all libraries start');

        var libraries = {};
        return vow
            .all(libraryNodes.map(function(node) {
                return loadLibraryVersions(config.get('github:librariesRepository'), node, libraries);
            }))
            .then(
                function() {
                    logger.info('Libraries successfully loaded');
                    return libraries;
                },
                function() { logger.error('Error occur while loading libraries'); }
            );
    }
};

/**
 * Load data for single version of library
 * @param repo - {Object} libraries repository
 * @param node - {BaseNode} node
 * @param libraries - {Object} libraries hash
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadLibraryVersions = function(repo, node, libraries) {
    libraries[node.lib] = libraries[node.lib] || {};

    return providers.getProviderGhApi()
        .load({ repository: _.extend({ path: node.lib }, repo) })
        .then(function(result) {
            var promises = result.res.map(function(version) {
                var _path = u.format('%s/%s/data.json', node.lib, version.name);
                return providers.getProviderGhHttps()
                    .load({ repository: _.extend({ path: _path }, repo) })
                    .then(function(result) {
                        libraries[node.lib][version.name] = result;
                    });
            });

            return vow.all(promises);
        });
};
