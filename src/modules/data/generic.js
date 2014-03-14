'use strict';

var vow = require('vow'),

    config = require('../../config'),
    common = require('./common');

module.exports = {
    load: function(disk, file) {

        /**
         * Load documentation data from Yandex disk through Yandex disk API
         * @returns {Promise}
         */
        var fromYandexDisk = function(file) {
            return common
                .loadData(common.PROVIDER_YANDEX_DISK, {
                    path: config.get(file)
                })
                .then(function(content) {
                    return JSON.parse(content);
                });
        };

        /**
         * Load documentation data from local filesystem
         * @returns {Promise}
         */
        var fromLocalFile = function(file) {
            return common
                .loadData(common.PROVIDER_FILE, {
                    path: config.get(file)
                });
        };

        return 'production' === process.env.NODE_ENV ? fromYandexDisk(disk) : fromLocalFile(file);
    }
};
