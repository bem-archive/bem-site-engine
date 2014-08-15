var path = require('path'),

    vow = require('vow'),
    cronJob = require('cron').CronJob,

    util = require('./util'),
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

