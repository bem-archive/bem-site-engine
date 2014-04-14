'use strict';

var u = require('util'),

    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    file = require('./file'),
    disk = require('./disk');

var MSG = {
    ERROR: {
        LOAD: 'Load data provider not recognized',
        SAVE: 'Save data provider not recognized'
    }
};

module.exports = {

    PROVIDER_FILE: 0,
    PROVIDER_DISK: 1,

    /**
     * Initialize github API and yandex disk API
     */
    init: function() {
        disk.init();
        return this;
    },

    /**
     * Load data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {Object} result
     */
    load: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return file.load(options);
            case this.PROVIDER_DISK:
                return disk.load(options);
            default:
                logger.error(MSG.ERROR.LOAD);
        }
    },

    /**
     * Save data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {}
     */
    save: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return file.save(options);
            default:
                logger.error(MSG.ERROR.SAVE);
        }
    }
};
