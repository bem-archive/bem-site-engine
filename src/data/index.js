var path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),

    config = require('./lib/config'),
    logger = require('./lib/logger')(module),
    providers = require('./providers'),
    snapshot = require('./snapshot');

var MSG = {
    INFO: {
        START: '-- data compiler module start --',
        END: '-- data compiler successfully finished --'
    },
    ERROR: 'Error'
};

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath, opts) {
        logger.info(''.toUpperCase.apply(MSG.INFO.START));

        logger.debug('Version %s of data will be settled', opts.version);
        logger.debug('Start compile data for %s environment', opts.environment);

        var isDev = 'dev' === opts.environment,
            provider =  isDev ?
                providers.getProviderFile() : providers.getProviderYaDisk(),
            env = isDev ? '' : opts.environment,
            promise = opts.version ? vow.resolve() : snapshot.run(modelPath);

            return promise.then(function() {
                return provider
                    .listDir({ path: path.join(config.get('common:model:dir')) })
                    .then(function(snapshots) {
                        if('latest' === opts.version)
                            opts.version = 0;
                        if('previous' === opts.version)
                            opts.version = -1;

                        var targetSnapshot = getTargetShaphot(snapshots, opts.version || 0);

                        if(!targetSnapshot) {
                            return vow.reject('Target snapshot was not found');
                        }

                        logger.info('Data will be updated to %s snapshot version', targetSnapshot);
                        return replaceFiles(provider, env, targetSnapshot);
                    });
            })
            .then(function() {
                logger.info(''.toUpperCase.apply(MSG.INFO.END))
            })
            .fail(function(err) {
                logger.error(''.toUpperCase.apply(MSG.ERROR), err)
            });
    }
};

/**
 * Method for resolving name of snapshot folder
 * @param snapshots - {Array} array with names of snapshot folders
 * @param version - {Number} name of version
 * @returns {*}
 */
var getTargetShaphot = function(snapshots, version) {
    var targetSnapshot;

    snapshots = snapshots
        .map(function(snapshot) {
            return _.isObject(snapshot) ? snapshot.displayName : snapshot;
        })
        .filter(function(snapshot) {
            return /snapshot_\d{1,2}:\d{1,2}:\d{1,4}-\d{1,2}:\d{1,2}:\d{1,2}/.test(snapshot);
        })
        .sort(function(a, b) {
            var re = /snapshot_(\d{1,2}):(\d{1,2}):(\d{1,4})-(\d{1,2}):(\d{1,2}):(\d{1,2})/;
            a = a.match(re);
            b = b.match(re);
            a = new Date(a[3], a[2]-1, a[1], a[4], a[5], a[6], 0);
            b = new Date(b[3], b[2]-1, b[1], b[4], b[5], b[6], 0);
            return b.getTime() - a.getTime();
        });

    if(_.isNumber(+version) && !_.isNaN(+version)) {
        targetSnapshot = snapshots[(-1)*(+version)];

        if(!targetSnapshot) {
            logger.error('There no available snapshots for rollback step %s', +version);
        }
    }else {
        if(snapshots.indexOf(version) < 0) {
            logger.error('Snapshot with name %s was not found in list of snapshots', version);
        }else {
            targetSnapshot = version;
        }
    }

    return targetSnapshot;
};

/**
 * Method for replacement data and marker files from snapshots directories to target environment directories
 * @param provider - {Object} provider object that can differ from one environment to another
 * @param environment - {String} name of environment
 * @param targetSnapshot - {String} name of snapshot folder
 * @returns {*}
 */
var replaceFiles = function(provider, environment, targetSnapshot) {
    var targetFiles = [
        config.get('common:model:data'),
        config.get('common:model:marker'),
        config.get('common:model:search:libraries'),
        config.get('common:model:search:blocks'),
        'sitemap.xml'
    ];

    return vow
        .all(targetFiles.map(function(item) {
            return  provider.copy({
                source: path.join(config.get('common:model:dir'), targetSnapshot, item),
                target: path.join(config.get('common:model:dir'), environment, item)
            });
        }))
        .then(
            function() {logger.info('Data files have been successfully replaced')},
            function() {logger.error('Error occur while data files replacement')}
        );
};
