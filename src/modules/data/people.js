var path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    generic = require('./generic');

var peopleHash = {},
    peopleUrls = {};

var MSG = {
    INFO: {
        START: 'Load all people start',
        SUCCESS: 'People succssfully loaded'
    },
    ERROR: 'Error while loading people occur'
};

module.exports = {

    /**
     * Loads people data
     * @returns {Promise}
     */
    load: function() {
        logger.info(MSG.INFO.START);

        /**
         * Success callback for data loading
         * @param content - {Object} loaded and parsed content
         * @returns {*}
         */
        var  onSuccess = function(content) {
            logger.info(MSG.INFO.SUCCESS);

            peopleHash = content;
            return peopleHash;
        };

        /**
         * Error callback for data loading
         * Simply log error message
         */
        var onError = function() {
            logger.error(MSG.ERROR);
        };

        return generic
            .load('data:people:disk', 'data:people:file')
            .then(onSuccess, onError);
    },

    /**
     * Returns people hash
     * @returns {Object}
     */
    getPeople: function() {
        return peopleHash;
    },

    /**
     * Returns people urls
     * @returns {Object}
     */
    getUrls: function() {
        return peopleUrls;
    }
};
