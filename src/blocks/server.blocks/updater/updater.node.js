var url = require('url'),

    request = require('request'),
    CronJob = require('cron').CronJob;

modules.define('updater', ['logger', 'config', 'util', 'model', 'middleware__redirect'],
    function (provide, logger, config, util, model, redirect) {
    logger = logger(module);

    var job,
        marker;

    function update(snapshotName) {
        logger.warn('Data has been changed. Model will be updated to %s for process %s', snapshotName, process.pid);

        model.reload(snapshotName)
            .then(function () {
                redirect.init();
                marker = snapshotName;
                logger.info('Model has been reloaded successfully for process %s to version %s',
                    process.pid, snapshotName);
                return marker;
            });
    }

    function checkForUpdate() {
        logger.info('Check for update for start');
        var provider = config.get('provider'),
            host,
            port,
            link;

        if (!provider) {
            logger.warn('Provider is not configured for application. Update will be skipped');
            return;
        }

        host = provider.host;
        port = provider.port;

        if (!host) {
            logger.warn('Provider host name is not configured for application. Update will be skipped');
            return;
        }

        if (!port) {
            logger.warn('Provider port number is not configured for application. Update will be skipped');
            return;
        }

        link = url.format({
            protocol: 'http',
            hostname: host,
            port: port,
            pathname: '/ping/' + 'testing' // TODO remove this testing code!
            //pathname: '/ping/' + config.get('NODE_ENV')
        });

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
