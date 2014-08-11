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

    return loadFile(config.get('common:model:marker'))
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
                                source: path.join(
                                    config.get('common:model:dir'),
                                    config.get('NODE_ENV'),
                                    config.get('common:model:dir')
                                ),
                                target: path.join(
                                    process.cwd(),
                                    'backups',
                                    config.get('common:model:dir')
                                )
                            }),
                            providers.getProviderYaDisk().downloadFile({
                                source: path.join(
                                    config.get('common:model:dir'),
                                    config.get('NODE_ENV'),
                                    'sitemap.xml'
                                ),
                                target: path.join(process.cwd(), 'sitemap.xml')
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
 * Check if current environment is development
 * @returns {boolean}
 */
var isDev = function() {
    return 'development' === config.get('NODE_ENV');
};

/**
 * Loads file from local filesystem or Yandex Disk
 * depending on application environment
 * @param fileName - {String} name of file
 * @returns {*}
 */
//var downloadFile = function(fileName) {
//    var provider =
//        opts = { path: path.join(config.get('common:model:dir'),
//            isDev() ? '' : config.get('NODE_ENV'), fileName) };
//
//    return ({
//
//    });
//};

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

