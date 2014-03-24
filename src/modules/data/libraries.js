'use strict';

var vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    generic = require('./generic');

var MSG = {
    INFO: {
        START: 'Load libraries start',
        SUCCESS: 'Libraries data has been successfully loaded'
    },
    ERROR: 'Libraries data loading filed with error'
};

var librariesHash = {};

module.exports = {

    /**
     * Loads libraries data
     * @returns {Promise}
     */
    load: function() {
        logger.info(MSG.INFO.START);

        /**
         * Success callback for data loading
         * @param content - {Object} loaded and parsed content
         * @returns {*}
         */
        var onSuccess = function(content) {
            logger.info(MSG.INFO.SUCCESS);

            librariesHash = content;
            return librariesHash;
        };

        /**
         * Error callback for data loading
         * Simply log error message
         */
        var onError = function() {
            logger.error(MSG.ERROR);
        };

        return generic.load('data:libraries').then(onSuccess, onError);
    },

    /**
     * Returns libraries map object
     * @returns {Object}
     */
    getLibraries: function() {
        return librariesHash;
    }
};