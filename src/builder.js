var path = require('path'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    serverMiddleware = require('enb/lib/server/server-middleware'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache');

var enbBuilder;

/**
 * Rebuilds techs
 * @param targets - {Array} array of paths to tech files for rebuild
 * @returns {*}
 */
exports.build = function(targets) {
    enbBuilder = enbBuilder || serverMiddleware.createBuilder({
        cdir: process.cwd(),
        noLog: false
    });

    return vow.all(
        targets.map(function (target) {
            return enbBuilder(target).then(function() {
                dropRequireCache(require, target);
                return target;
            });
        })
    );
};

