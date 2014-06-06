var path = require('path'),

    cronJob = require('cron').CronJob,

    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),
    providers = require('../providers');

var job,
    marker;

module.exports = {

    /**
     * Initialize update cron job without starting
     * @param master - {Object} master process of cluster
     * @returns {exports}
     */
    init: function(master) {
        providers.init();

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
    logger.debug('Check for update for master process start');

    var provider = util.isDev() ? providers.getFileProvider() : providers.getYaDiskProvider(),
        opts = { path: path.join(config.get('common.model:dir'),
            util.isDev() ? '' : config.get('NODE_ENV'), config.get('common.model:marker')) }

    return provider.load(opts)
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

                return util.clearCache().then(function() {
                    logger.info('restart application by data changing event');

                    util.loadSitemapXml();
                    master.softRestart();
                });
            }
        })
        .fail(function() {
            logger.error('Error occur while loading and parsing marker file');
        });
};
