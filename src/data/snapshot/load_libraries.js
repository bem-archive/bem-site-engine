var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

/**
 * Load data for single version of library
 * @param repo - {Object} libraries repository
 * @param node - {BaseNode} node
 * @param libraries - {Object} libraries hash
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
function loadLibraryVersions(repo, node, libraries) {
    libraries[node.lib] = libraries[node.lib] || {};

    return providers.getProviderGhApi()
        .load({ repository: _.extend({ path: node.lib }, repo) })
        .then(function(result) {
            var promises = result.res.map(function(version) {
                var _path = u.format('%s/%s/data.json', node.lib, version.name);
                return providers.getProviderGhHttps()
                    .load({ repository: _.extend({ path: _path }, repo) })
                    .then(
                    function(result) {
                        libraries[node.lib][version.name] = result;
                    },
                    function(err) {
                        logger.error('Error %s while loading data for library %s version %s', err, node.lib, version.name);
                    }
                );
            });

            return vow.all(promises);
        });
}

module.exports = function(libraryNodes) {

    logger.info('Load all libraries start');

    var err,
        libraries = {},
        lr = config.get('common:github:libraries');

    if(!lr) {
        err = 'Libraries repository was not set in configuration'
    }

    if(!lr.type || !_.isString(lr.type) || !lr.type.length) {
        err = 'Type of libraries repository was not set in configuration';
    }

    if(!lr.user || !_.isString(lr.user) || !lr.user.length) {
        err = 'User field of libraries repository was not set in configuration';
    }

    if(!lr.repo || !_.isString(lr.repo) || !lr.repo.length) {
        err = 'Name of libraries repository was not set in configuration';
    }

    if(!lr.ref  || !_.isString(lr.ref)  || !lr.ref.length) {
        err = 'Reference of libraries repository was not set in configuration';
    }

    if(!lr.pattern || !_.isString(lr.pattern) || !lr.pattern.length) {
        err = 'Pattern for libraries repository was not set in configuration';
    }

    if(err) {
        logger.error(err);
        return vow.resolve(libraries);
    }

    return vow
        .all(libraryNodes.map(function(node) {
            return loadLibraryVersions(lr, node, libraries);
        }))
        .then(function() {
            logger.info('Libraries successfully loaded');
            return libraries;
        })
        .fail(function() {
            logger.error('Error occur while loading libraries');
        });
};
