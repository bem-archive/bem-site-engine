var path = require('path'),

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

                return clearCache('cache').then(function() {
                    (function(fileName) {
                        return loadFile(fileName).then(function(content) {
                            return providers.getProviderFile().save({
                                data: content,
                                path: path.join(process.cwd(), fileName)
                            });
                        });
                    })('sitemap.xml');

                    console.info('restart application by data changing event');
                    master.softRestart();
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
var loadFile = function(fileName) {
    var provider = isDev() ?
            providers.getProviderFile() :
            providers.getProviderYaDisk(),
        opts = { path: path.join(config.get('common:model:dir'),
            isDev() ? '' : config.get('NODE_ENV'), fileName) };

    return provider.load(opts);
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
            ])
        });
};

