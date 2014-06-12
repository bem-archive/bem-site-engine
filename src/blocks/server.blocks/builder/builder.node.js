var path = require('path'),
    vow = require('vow'),
    vfs = require('vow-fs');

modules.define('builder', ['util'], function(provide, util) {
    var enbBuilder;

    provide({
        build: function(targets) {

            if(!util.isDev()) {
                return vow.resolve();
            }

            var serverMiddleware = require('enb/lib/server/server-middleware'),
                dropRequireCache = require('enb/lib/fs/drop-require-cache');

            enbBuilder = enbBuilder || serverMiddleware.createBuilder({
                cdir: process.cwd(),
                noLog: false
            });

            return vow.all(
                targets.map(function (target) {
                    return enbBuilder(target).then(function () {
                        dropRequireCache(require, target);
                        return target;
                    });
                })
            );
        }
    });
});
