'use strict';

var vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    generic = require('./generic');

var MSG = {
    INFO: {
        START: 'Load libraries start',
        SUCCESS: 'Libraries data has been successfully loaded'
    }
};

var librariesHash = {};

module.exports = {

    /**
     * Loads libraries data
     * @returns {Promise}
     */
    load: function() {
        logger.info(MSG.INFO.START);

        return generic.load('data:libraries:disk', 'data:libraries:file')
            .then(function(content) {
                logger.info(MSG.INFO.SUCCESS);

                librariesHash = content;
                return librariesHash;
            });
    },

    /**
     * Returns libraries map object
     * @returns {Object}
     */
    getLibraries: function() {
        return librariesHash;
    }
};