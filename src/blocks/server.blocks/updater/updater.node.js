var path = require('path'),

    vow = require('vow'),
    cronJob = require('cron').CronJob;

modules.define('updater', ['logger', 'config', 'util', 'model', 'middleware__router', 'middleware__redirect'],
    function(provide, logger, config, util, model, router, redirect) {

    logger = logger(module);

    var job,
        marker;

    /**
     * Removes and recreates cache folder
     * @returns {*}
     */
    function reloadCache() {
        logger.debug('reload cache data for examples start');
        return providerFile
            .removeDir({ path: path.join(process.cwd(), 'cache') })
            .then(function() {
                return providerFile.makeDir({ path: path.join(process.cwd(), 'cache') });
            })
            .then(function() {
                return vow.all([
                    providerFile.makeDir({ path: path.join(process.cwd(), 'cache/tag') }),
                    providerFile.makeDir({ path: path.join(process.cwd(), 'cache/branch') })
                ]);
            })
            .then(function() {
                logger.debug('cached data has been reloaded successfully');
            })
            .fail(function(err) {
                logger.error('Error occur while cache reloading %s', err.message);
            });
    }

    /**
     * Reloads sitemap.xml file
     * @returns {*}
     */
    function reloadSitemapXML() {
        var XML = 'sitemap.xml',
            XMLSourcePath =
                path.join(config.get('model:dir'), util.isDev() ? '' : config.get('NODE_ENV'), XML),
            XMLTargetPath = path.join(process.cwd(), XML);

        logger.debug('reload load "sitemap.xml" file start');
        return providerFile.exists({ path: XMLTargetPath }).then(function(exists) {
                if(exists) {
                    return providerFile.remove({ path: XMLTargetPath }).then(function() {
                        return providerDisk.downloadFile({ source: XMLSourcePath, target: XMLTargetPath });
                    });
                }
            })
            .then(function() {
                logger.debug('"sitemap.xml" file has been loaded successfully');
            })
            .fail(function(err) {
                logger.error('Error occur while "sitemap.xml" file reloading %s', err.message);
            });
    }

    function update(content) {
        logger.warn('Data has been changed. Model will be reloaded');

        model.reload()
            .then(function() {
                router.init();
                redirect.init();
                marker = content;
                return marker;
            })
            .then(reloadCache)
            .then(reloadSitemapXML);
    }

    function checkForUpdate() {
        logger.info('Check for update for start');

        return provider.load({
                path: path.join(
                    config.get('model:dir'),
                    util.isDev() ? '' : config.get('NODE_ENV'),
                    'marker.json'
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
                    update(content);
                }
            })
            .fail(function(err) {
                logger.error('Error %s', err.message);
            });
    }

    provide({
        /**
         * Initialize updater module
         */
        init: function() {
            job = new cronJob({
                cronTime: config.get('update:cron'),
                onTick: function() { checkForUpdate() },
                start: false
            });
        },

        /**
         * Starts updater job
         */
        start: function() {
            job.start();
        },

        getMarker: function() {
            return marker || {};
        }
    });
});
