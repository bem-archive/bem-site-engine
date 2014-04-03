var u = require('util'),
    path = require('path'),

    cronJob = require('cron').CronJob,
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../logger')(module),
    config = require('../config'),
    constants = require('../modules/constants'),
    data = require('../modules/data');


var MSG = {
    DEBUG: {
        CHECK_START: 'Check for update for master process start'
    },
    INFO: {
        INIT: 'Init data updater for master process',
        START: 'Start data updater for master process',
        DATA_CHANGED: 'Data has been changed. All application worker will be restarted'
    },
    WARN: {
        MARKER_NOT_LOADED: 'Marker file has not been loaded'
    },
    ERROR: {
        MARKER_LOAD: 'Error occur while loading and parsing marker file'
    }
};

var job,
    marker;

module.exports = {

    /**
     * Initialize update cron job without starting
     * @param master - {Object} master process of cluster
     * @returns {exports}
     */
    init: function(master) {
        logger.info(MSG.INFO.INIT);

        //initialize data providers with configured credentials
        data.common.init();

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
        logger.info(MSG.INFO.START);
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
    logger.debug(MSG.DEBUG.CHECK_START);

    var promise;

    if('development' === config.get('NODE_ENV')) {
        promise = data.common.loadData(data.common.PROVIDER_FILE, {
            path: config.get('data:marker')
        });
    }else {
        promise = data.common.loadData(data.common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:marker')
        }).then(function (content) {
            return JSON.parse(content);
        });
    }

    var onSuccessLoading = function(content) {
            if(!content) {
                logger.warn(MSG.WARN.MARKER_NOT_LOADED);
                return;
            }

            //marker is not exist for first check operation
            if(!marker) {
                marker = content;
                return;
            }

            //compare sha sums for data objects
            if(marker.data !== content.data) {

                logger.info(MSG.INFO.DATA_CHANGED);

                fs.removeDir(path.resolve(constants.DIRS.CACHE, constants.DIRS.BRANCH))
                    .then(function() {
                        fs.makeDir(path.join(constants.DIRS.CACHE, constants.DIRS.BRANCH));
                    })
                    .then(function() {
                        master.softRestart(); //restart all cluster workers
                    });
            }

            marker = content;
        },
        onErrorLoading = function() {
            logger.error(MSG.ERROR.MARKER_LOAD);
        };

    return promise.then(onSuccessLoading, onErrorLoading);
};
