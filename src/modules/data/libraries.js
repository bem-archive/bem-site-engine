var u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    common = require('./common');

var librariesHash = {};

module.exports = {

    load: function(nodesWithLib) {
        logger.info('Load libraries start');

        var promises = nodesWithLib.map(function(node) {
            return loadLibraryVersions(config.get('github:librariesRepository'), node);
        });

        return vow
            .allResolved(promises)
            .then(function() {
                return nodesWithLib;
            });
    },

    getLibraries: function() {
        return librariesHash;
    }
};

var loadLibraryVersions = function(librariesRepository, node) {
    librariesHash[node.lib] = librariesHash[node.lib] || {};

    return common
        .loadData(_.extend({ path: node.lib }, librariesRepository), common.PROVIDER_GITHUB_API)
        .then(function(result) {
            var promises = result.res.map(function(version) {
                return loadVersionData(librariesRepository, node, version);
            });

            return vow.allResolved(promises);
        });
};

var loadVersionData = function(librariesRepository, node, version) {
    var _path = u.format('%s/%s/data.json', node.lib, version.name);
    return common
        .loadData(_.extend({ path: _path }, librariesRepository), common.PROVIDER_GITHUB_HTTPS)
        .then(function(result) {
            librariesHash[node.lib][version.name] = result;
        });
};
