var path = require('path'),
    vow = require('vow'),
    config = require('./config'),
    providers = require('../data/providers');

var env = config.get('NODE_ENV'),
    cacheDirectory = path.join(process.cwd(), 'cache'),
    yaDiskDirectory = config.get('common:model:dir'),
    dataFileName = config.get('common:model:data'),
    dataSourcePath = path.join(yaDiskDirectory, env, dataFileName),
    dataTargetPath = path.join(process.cwd(),'backups', dataFileName),
    sitemapSourcePath = path.join(yaDiskDirectory, env, 'sitemap.xml'),
    sitemapTargetPath = path.join(process.cwd(), 'sitemap.xml');

module.exports = {

    /**
     * Creates cache subdirectories
     * @param dir - {String} path to cache folder
     * @returns {*}
     */
    makeCacheDirs: function() {
        return vow.all([
            providers.getProviderFile().makeDir({ path: path.join(cacheDirectory, 'branch') }),
            providers.getProviderFile().makeDir({ path: path.join(cacheDirectory, 'tag') })
        ]);
    },

    /**
     * Clear and create empty cache folders
     * @returns {*}
     */
    clearCache: function() {
        return providers.getProviderFile().removeDir({ path: cacheDirectory })
            .then(function() { return this.makeCacheDirs(); }, this);
    },

    /**
     * Remove files from local filesystem
     * @returns {*}
     */
    removeFiles: function() {
        return vow.all([
            providers.getProviderFile().exists({ path: dataTargetPath }),
            providers.getProviderFile().exists({ path: sitemapTargetPath })
        ]).spread(function(dataExists, sitemapExists) {
            var promises = [];
            if(dataExists) {
                promises.push(providers.getProviderFile().remove({ path: dataTargetPath }));
            }
            if(sitemapExists) {
                promises.push(providers.getProviderFile().remove({ path: sitemapTargetPath }));
            }
            return vow.all(promises);
        });
    },

    /**
     * Downloads files from Yandex Disk to local filesystem
     * @returns {*}
     */
    downloadFiles: function() {
        return vow.all([
            providers.getProviderYaDisk().downloadFile({ source: dataSourcePath, target: dataTargetPath }),
            providers.getProviderYaDisk().downloadFile({ source: sitemapSourcePath, target: sitemapTargetPath })
        ]);
    }
};
