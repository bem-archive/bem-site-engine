var u = require('util'),
    path = require('path'),

    cronJob = require('cron').CronJob,
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    data = require('../data');

var job,
    marker;

module.exports = {

    /**
     * Init update cron job without start
     * @param master - {Object} master process of cluster
     * @returns {exports}
     */
    init: function(master) {
        logger.info('Init data updater for master process');

        data.common.init();

        job = new cronJob({
            cronTime: config.get('update:cron'),
            onTick: function() {
                checkForUpdate(master);
            },
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
 * Compare sha sums of lobraries, docs and sitemap with sums of precious check
 * If these sums are different then restart all cluster workers
 * @param master - {Object} master process
 * @returns {*}
 */
var checkForUpdate = function(master) {
    logger.debug('Check for update for master process start');

    var promise;

    //load marker.json file from local filesystem or Yandex Disk
    if('production' === process.env.NODE_ENV) {
        promise = data.common.loadData(data.common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:marker:disk')
        }).then(function(content) {
                return JSON.parse(content);
            });
    }else {
        promise = data.common.loadData(data.common.PROVIDER_FILE, {
            path: config.get('data:marker:file')
        });
    }

    return promise.then(function(content) {
        if(!content) {
            logger.warn('Marker file has not been loaded');
            return;
        }

        //marker is not exist for first check operation
        if(!marker) {
            marker = content;
            return;
        }

        //compare sha sums for libraries, docs and sitemap
        if(marker.sitemap !== content.sitemap ||
            marker.docs !== content.docs ||
            marker.libraries !== content.libraries) {

            logger.info('Data has been changed. All application worker will be restarted');

            fs.removeDir(path.resolve('cache', 'branch'))
                .then(function() {
                    fs.makeDir(path.join('cache', 'branch'));
                })
                .then(function() {
                    //restart all cluster workers
                    master.softRestart();
                });
        }

        marker = content;
    });
};
