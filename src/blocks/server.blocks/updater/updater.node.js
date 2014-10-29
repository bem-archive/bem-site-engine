var luster = require('luster'),
    request = require('request'),
    CronJob = require('cron').CronJob;

modules.define('updater', ['logger', 'config', 'util', 'model', 'middleware__redirect'],
    function (provide, logger, config, util, model, redirect) {
    logger = logger(module);

    var job,
        worker = luster.id || 0,
        marker;

    function update(snapshotName) {
        logger.warn('Data has been changed. Model will be updated to %s for worker %s', snapshotName, worker);

        model.reload(snapshotName)
            .then(function () {
                redirect.init();
                marker = snapshotName;
                logger.info('Model has been reloaded successfully for worker %s to version %s', worker, snapshotName);
                return marker;
            });
    }

    function checkForUpdate() {
        logger.info('Check for update for start');
        var link = util.getPingLink();

        if(!link) {
            return;
        }

        request(link, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (!body) {
                    logger.error('Can not retrieve request body');
                    return;
                }

                // marker is not exist for first check operation
                if (!marker) {
                    marker = body;
                    return;
                }

                // compare sha sums for data objects
                if (marker !== body) {
                    update(body);
                } else {
                    logger.debug('Data was not changed');
                }
            } else {
                logger.error(error);
                logger.error('Can not receive data from url %s. ' +
                'Possible provider is in shutdown mode or other network problems occur', link);
            }
        });
    }

    provide({
        /**
         * Initialize updater module
         */
        init: function () {
            job = new CronJob({
                cronTime: config.get('update:cron'),
                onTick: function () { checkForUpdate(); },
                start: false
            });
        },

        /**
         * Starts updater job
         */
        start: function () {
            job.start();
        },

        getMarker: function () {
            return marker || {};
        }
    });
});
