var util = require('util'),
    path = require('path'),

    vow = require('vow'),
    config = require('./config'),
    providers = require('./providers'),
    constants = require('./constants'),
    logger = require('./logger'),
    utility = require('util');

exports.makeSnapshot = function() {

};

/**
 * Uploads all files in snapshot directory from local filesystem to Yandex Disk
 * @param snapshot - {String} snapshot name
 * @returns {*}
 */
exports.uploadSnapshot = function(snapshot) {
    var conf =  config.get('model');
    if(!conf || !conf.dir) {
        var err = 'Target directory for data on Yandex Disk was not configured';
        logger.error(err, module);
        return vow.reject(err);
    }

    logger.debug(util.format('Start to upload snapshot %s to Yandex Disk. Please Wait ....', snapshot), module);

    return providers.getProviderYaDisk().makeDir({ path: path.join(conf.dir, snapshot) })
        .then(function() {
            return providers.getProviderYaDisk().uploadDir({
                source: path.join('backups', snapshot),
                target: path.join(conf.dir, snapshot)
            });
        })
        .then(function() {
            logger.info('Data files have been successfully uploaded', module);
        })
        .fail(function() {
            logger.error('Error occur while data files upload', module);
        });
};

/**
 * Method for replacement data and marker files from snapshots directories to target environment directories
 * @param provider - {Object} provider object that can differ from one environment to another
 * @param folder - {String} name of folder
 * @param version - {String} version
 * @returns {*}
 */
exports.setSnapshotActive = function(provider, folder, version) {
    logger.info(util.format('Start to replace data files for version "%s" environment "%s"',
        version, (folder.length ? folder : 'dev')), module);

    return utility.getSnapshot(provider, version).then(function(snapshot) {
        return vow
            .all(constants.FILES.map(function(item) {
                return provider.copy({
                    source: path.join(config.get('model:dir'), snapshot, item),
                    target: path.join(config.get('model:dir'), folder, item)
                });
            }))
            .then(function() {
                logger.info('Data files have been successfully replaced', module);
            })
            .fail(function() {
                logger.error('Error occur while data files replacement', module);
            });
    });
};
