'use strict';

var vow = require('vow'),

    config = require('../../config'),
    common = require('./common');

module.exports = {

    /**
     * Loads data from yandex disk or file depending on enviroment
     * @param key - {String} config key for yandex disk of file path
     * @returns {Promise}
     */
    load: function(key) {

        /**
         * Load documentation data from Yandex disk through Yandex disk API
         * @param file - {String} config key for yandex disk path
         * @returns {Promise}
         */
        var fromYandexDisk = function(key) {
            return common
                .loadData(common.PROVIDER_YANDEX_DISK, {
                    path: config.get(key)
                })
                .then(function(content) {
                    return JSON.parse(content);
                });
        };

        /**
         * Load documentation data from local filesystem
         * @param file - {String} config key for local filesystem path
         * @returns {Promise}
         */
        var fromLocalFile = function(key) {
            return common
                .loadData(common.PROVIDER_FILE, {
                    path: config.get(key)
                });
        };

        return 'development' === config.get('NODE_ENV') ? fromLocalFile(key) : fromYandexDisk(key);
    }
};
