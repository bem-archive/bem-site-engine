var path = require('path'),

    vow = require('vow'),
    cronJob = require('cron').CronJob,

    config = require('./config'),
    providers = require('../data/providers');

var job,
    marker,
    util = (function() {
        var env = config.get('NODE_ENV'),
            cacheDirectory = path.join(process.cwd(), 'cache'),
            yaDiskDirectory = config.get('common:model:dir'),
            dataFileName = config.get('common:model:data'),
            dataSourcePath = path.join(yaDiskDirectory, env, dataFileName),
            dataTargetPath = path.join(process.cwd(),'backups', dataFileName),
            sitemapSourcePath = path.join(yaDiskDirectory, env, 'sitemap.xml'),
            sitemapTargetPath = path.join(process.cwd(), 'sitemap.xml');

        return {

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
    })();

/**
 * Loads marker file from local filesystem or Yandex Disk depending on enviroment
 * Compare sha sums of data object with sums of previous check
 * If these sums are different then restart all cluster workers
 * @param master - {Object} master process
 * @returns {*}
 */
var checkForUpdate = function(master) {
    console.info('Check for update for master process start');

    return providers.getProviderYaDisk().load({
        path: path.join(
            config.get('common:model:dir'),
            config.get('NODE_ENV'),
            config.get('common:model:marker')
        )
    })
        .then(function (content) {
            return JSON.parse(content);
        })
        .then(function(content) {
            if(!content) {
                return;
            }

            //marker is not exist for first check operation
            if(!marker) {
                marker = content;
                return;
            }

            //compare sha sums for data objects
            if(marker.data !== content.data) {
                marker = content;

                return util.clearCache()
                    .then(util.removeFiles)
                    .then(util.downloadFiles)
                    .then(function() {
                        console.log('Restart all workers');
                        return master.softRestart();
                    });
            }
        })
        .fail(function() {
            console.error('Error!');
        });
};

module.exports = {

    /**
     * Initialize update cron job without starting
     * @param master - {Object} master process of cluster
     * @returns {exports}
     */
    init: function(master) {
        providers.getProviderYaDisk().init();

        job = new cronJob({
            cronTime: config.get('app:update:cron'),
            onTick: function() { checkForUpdate(master) },
            start: true
        });

        return this;
    },

    /**
     * Starts cron job for data update
     * @returns {exports}
     */
    start: function() {
        job.start();
        return this;
    }
};


