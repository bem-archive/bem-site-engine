var u = require('util'),
    path = require('path'),

    CronJob = require('cron').CronJob;

modules.define('updater', ['logger', 'config', 'util', 'model', 'middleware__redirect', 'yandex-disk'],
    function (provide, logger, config, util, model, redirect, yd) {
    logger = logger(module);

    var job,
        luster = util.isDev() ? { id: 0 } : require('luster'),
        worker = luster.id || 0,
        marker;

    yd.init(config.get('yandex-disk'));

    provide({
        /**
         * Initialize updater module
         */
        init: function () {
            var _this = this;
            job = new CronJob({
                cronTime: config.get('update:cron'),
                onTick: function () { _this.checkForUpdate(); },
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
        },

        update: function (snapshotName) {
            logger.warn('Data has been changed. Model will be updated to %s for worker %s', snapshotName, worker);

            return model.reload(snapshotName)
                .then(function () {
                    return util.clearPageCache();
                })
                .then(function () {
                    redirect.init();
                    marker = snapshotName;
                    logger.info(
                        'Model has been reloaded successfully for worker %s to version %s', worker, snapshotName);
                    return marker;
                });
        },

        checkForUpdate: function () {
            logger.info('Check for update for start for worker %s', worker);

            yd.get().readFile(path.join(yd.get().getNamespace(), config.get('NODE_ENV')))
                .then(function (snapshotName) {
                    if (!snapshotName.match(/[0-9]{1,}:[0-9]{1,}:[0-9]{4}-[0-9]{1,}:[0-9]{1,}:[0-9]{1,}/)) {
                        logger.error(
                            u.format('Snapshot name for %s environment has invalid format', config.get('NODE_ENV')));
                        return;
                    }

                    if (!snapshotName) {
                        logger.error(u.format('Snapshot name for %s environment undefined', config.get('NODE_ENV')));
                        return;
                    }

                    // marker is not exist for first check operation
                    if (!marker) {
                        marker = snapshotName;
                        return;
                    }

                    // compare sha sums for data objects
                    if (marker !== snapshotName) {
                        this.update(snapshotName);
                    } else {
                        logger.debug('Data was not changed for worker %s', worker);
                    }
                }, this)
                .fail(function (error) {
                    logger.error(error);
                    logger.error('Can not receive data from Yandex Disk. Possible network problems occur.');
                })
                .done();
        }
    });
});
