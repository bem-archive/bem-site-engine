var vow = require('vow'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    data = require('../../modules/data'),
    common = data.common;


var MSG = {
    DEBUG: {
        FILE_SUCCESS: 'Data has been saved to file %s',
        DISK_SUCCESS: 'Data has been saved to yandex disk %s'
    },
    INFO: {
        START_FILE: 'Save data to file %s',
        START_DISK: 'Save data to Yandex Disk %s'
    },
    ERROR: {
        DISK: 'Error occur while saving data to yandex disk %s',
        FILE: 'Error occur while saving data to file %s'
    }
};

module.exports = {
    run: function(content) {
        return saveAndUpload(content, 'data:sitemap').then(function() {
            return createUpdateMarker(data);
        });
    }
};

/**
 * Saves data object into *.json file in dev enviroment
 * or upload it to Yandex Disk in production enviroment
 * @param content - {Object} object with should be saved
 * @returns {*}
 */
var saveAndUpload = function(content, path) {

    var saveToYandexDisk = function() {
            logger.info(MSG.INFO.START_DISK, config.get(path));

            return common
                .saveData(common.PROVIDER_YANDEX_DISK, {
                    path: config.get(path),
                    data: JSON.stringify(content)
                })
                .then(
                    function() { logger.debug(MSG.DEBUG.DISK_SUCCESS, config.get(path)); },
                    function() { logger.error(MSG.ERROR.DISK, config.get(path)); }
                );
        },
        saveToLocalFile = function() {
            logger.info(MSG.INFO.START_FILE, config.get(path));

            return common
                .saveData(common.PROVIDER_FILE, {
                    path: config.get(path),
                    data: content,
                    minimize: true
                })
                .then(
                    function() { logger.debug(MSG.DEBUG.FILE_SUCCESS, config.get(path)); },
                    function() { logger.error(MSG.ERROR.FILE, config.get(path)); }
                );
        };

    return 'development' === config.get('NODE_ENV') ? saveToLocalFile() : saveToYandexDisk();
};

/**
 * Create small json file with hashes from sitemap, docs, libraries and people data
 * It will be checked by application in runtime
 * @param data - {Object} data object
 * @returns {*}
 */
var createUpdateMarker = function(data) {
    logger.debug('Create update marker start');

    return saveAndUpload({
        data: sha(JSON.stringify(data))
    }, 'data:marker');
};
