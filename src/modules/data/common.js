'use strict';

var u = require('util'),

    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    providers = require('./providers');

module.exports = {

    PROVIDER_FILE: 0,
    PROVIDER_GITHUB_API: 1,
    PROVIDER_GITHUB_HTTPS: 2,
    PROVIDER_YANDEX_DISK: 3,
    PROVIDER_FILE_COMMON: 4,

    /**
     * Initialize github API and yandex disk API
     */
    init: function() {

        providers.githubAPI.init();
        providers.yandexDisk.init();

        return this;
    },

    /**
     * Load data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {Object} result
     */
    loadData: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return providers.jsonFile.load(options);
            case this.PROVIDER_GITHUB_API:
                return providers.githubAPI.getContent(options);
            case this.PROVIDER_GITHUB_HTTPS:
                return providers.githubHTTPS.load(options);
            case this.PROVIDER_YANDEX_DISK:
                return providers.yandexDisk.readFile(options);
            case this.PROVIDER_FILE_COMMON:
                return providers.commonFile.load(options);
            default:
                logger.error('load data provider not recognized');
        }
    },

    /**
     * Save data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {}
     */
    saveData: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return providers.jsonFile.save(options);
            case this.PROVIDER_YANDEX_DISK:
                return providers.yandexDisk.writeFile(options);
            case this.PROVIDER_FILE_COMMON:
                return providers.commonFile.save(options);
            default:
                logger.error('save data provider not recognized');
        }
    }
};