var path = require('path'),

    vow = require('vow'),
    vowFs = require('vow-fs'),

    cronJob = require('cron').CronJob,

    config = require('./config'),
    providers = require('../data/providers');

var job,
    marker;

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
            start: false
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

/**
 * Loads marker file from local filesystem or Yandex Disk depending on enviroment
 * Compare sha sums of data object with sums of previous check
 * If these sums are different then restart all cluster workers
 * @param master - {Object} master process
 * @returns {*}
 */
var checkForUpdate = function(master) {
    console.info('Check for update for master process start');

    var yaDiskDirectory = config.get('common:model:dir'),
        dataFileName = config.get('common:model:data'),
        env = config.get('NODE_ENV'),
        dataSourcePath = path.join(yaDiskDirectory, env, dataFileName),
        dataTargetPath = path.join(process.cwd(),'backups', dataFileName),
        sitemapSourcePath = path.join(yaDiskDirectory, env, 'sitemap.xml'),
        sitemapTargetPath = path.join(process.cwd(), 'sitemap.xml');

    return providers.getProviderYaDisk().load({
            path: path.join(yaDiskDirectory, env, config.get('common:model:marker'))
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

                return clearCache(path.join(process.cwd(), 'cache'))
                    .then(function() {
                        return vow.all([
                            providers.getProviderYaDisk().downloadFile({
                                source: dataSourcePath,
                                target: dataTargetPath
                            }),
                            providers.getProviderYaDisk().downloadFile({
                                source: sitemapSourcePath,
                                target: sitemapTargetPath
                            })
                        ]);
                    })
                    .then(function() {
                        return master.softRestart();
                    });
            }
        })
        .fail(function() {
            console.error('Error occur while loading and parsing marker file');
        });
};

/**
 * Clear and create empty cache folders
 * @param dir - {String} name of cache folder
 * @returns {*}
 */
var clearCache = function(dir) {
    return providers.getProviderFile()
        .removeDir({ path: dir })
        .then(function() {
            return vow.all([
                vowFs.makeDir(path.join(dir, 'branch')),
                vowFs.makeDir(path.join(dir, 'tag'))
            ]);
        });
};

