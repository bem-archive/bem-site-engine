var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    data = require('../../modules/data'),
    common = data.common;

var MSG = {
    INFO: {
        START: 'Load all libraries start',
        SUCCESS: 'Libraries successfully loaded'
    },
    ERROR: 'Error occur while loading libraries'
};

module.exports = {

    run: function(libraryNodes) {
        logger.info(MSG.INFO.START);

        var libraries = {};
        return vow
            .all(libraryNodes.map(function(node) {
                return loadLibraryVersions(config.get('github:librariesRepository'), node, libraries);
            }))
            .then(
                function() {
                    logger.info(MSG.INFO.SUCCESS);
                    return libraries;
                },
                function() { logger.error(MSG.ERROR); }
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

    return common
        .loadData(common.PROVIDER_GITHUB_API, { repository: _.extend({ path: node.lib }, repo) })
        .then(function(result) {
            var promises = result.res.map(function(version) {
                var _path = u.format('%s/%s/data.json', node.lib, version.name);
                return common
                    .loadData(common.PROVIDER_GITHUB_HTTPS, { repository: _.extend({ path: _path }, repo) })
                    .then(function(result) {
                        libraries[node.lib][version.name] = result;
                    });
            });

            return vow.all(promises);
        });
};
