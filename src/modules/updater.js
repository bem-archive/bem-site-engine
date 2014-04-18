var u = require('util'),
    p = require('path'),

    cronJob = require('cron').CronJob,
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../logger')(module),
    config = require('../config'),
    constants = require('./constants'),
    provider = require('./providers/index');

var job,
    marker;

module.exports = {

    /**
     * Initialize update cron job without starting
     * @param master - {Object} master process of cluster
     * @returns {exports}
     */
    init: function(master) {
        logger.info('Init data updater for master process');

        //initialize data providers with configured credentials
        provider.init();

        job = new cronJob({
            cronTime: config.get('update:cron'),
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
        logger.info('Start data updater for master process');
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

    var isDev = 'development' === config.get('NODE_ENV'),
        env = isDev ? null : config.get('NODE_ENV');

    var promise = isDev ?
        provider.load(provider.PROVIDER_FILE, {
            path: p.join(config.get('data:dir'), env, config.get('data:marker'))
        }):
        provider.load(provider.PROVIDER_DISK, {
            path: p.join(config.get('data:dir'), env, config.get('data:marker'))
        });

    var onSuccessLoading = function(content) {
            if(!content) {
                logger.warn('Marker file has not been loaded');
                return;
            }

            //marker is not exist for first check operation
            if(!marker) {
                marker = content;
                return;
            }

            //compare sha sums for data objects
            if(marker.data !== content.data) {

                logger.info('Data has been changed. All application worker will be restarted');

                /*
                return fs.removeDir(p.resolve(constants.DIRS.CACHE, constants.DIRS.BRANCH))
                    .then(function() {
                        return fs.makeDir(p.join(constants.DIRS.CACHE, constants.DIRS.BRANCH));
                    })
                    .then(function() {
                        return master.softRestart(); //restart all cluster workers
                    });
                */

                return master.softRestart(); //restart all cluster workers
            }

            marker = content;
        },
        onErrorLoading = function() {
            logger.error('Error occur while loading and parsing marker file');
        };

    return promise
        .then(function (content) {
            return JSON.parse(content);
        })
        .then(onSuccessLoading, onErrorLoading);
};
