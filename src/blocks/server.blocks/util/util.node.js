var path = require('path'),

    vow = require('vow'),
    vowFs = require('vow-fs');

modules.define('util', ['constants', 'config', 'providerFile', 'providerDisk'], function(provide, constants, config, providerFile, providerDisk) {

    provide({

        isDev: function() {
            return 'development' === config.get('NODE_ENV');
        },

        clearCache: function() {
            return providerFile.removeDir({ path: constants.DIRS.CACHE }).then(this.makeCache);
        },

        makeCache: function() {
            return vow.all([
                vowFs.makeDir(path.join(constants.DIRS.CACHE, constants.DIRS.BRANCH)),
                vowFs.makeDir(path.join(constants.DIRS.CACHE, constants.DIRS.TAG))
            ]);
        },

        loadSitemapXml: function() {
            var provider = util.isDev() ? providerFile : providerDisk,
                opts = { path: path.join(config.get('common:model:dir'),
                    this.isDev() ? '' : config.get('NODE_ENV'), constants.SITEMAP) };


            return provider.load(opts).then(function(content) {
                return provider.save({
                    data: content,
                    path: path.join(process.cwd(), constants.SITEMAP)
                });
            });
        }
    });
});
