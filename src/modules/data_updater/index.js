var u = require('util'),
    path = require('path'),

    cronJob = require('cron').CronJob,
    vow = require('vow'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    data = require('../data');

var job;

module.exports = {

    init: function(worker) {
        logger.info('Init data updater for worker %s', worker.wid);

        job = new cronJob({
            cronTime: '*/5 * * * * *',
            onTick: function() {
                checkForUpdate(worker);
            },
            start: false
        });
    },

    start: function() {
        logger.info('Start data updater');
        job.start();
    }
};

var checkForUpdate = function(worker) {
    logger.debug('Check for update for worker %s start', worker.wid);
};
