'use strict';

var vow = require('vow'),
    _ = require('lodash'),

    config = require('../../config'),
    logger = require('../../logger')(module),
    generic = require('./generic');

var MSG = {
    INFO: {
        START: 'Load documentation start',
        SUCCESS: 'Documentation data has been successfully loaded'
    },
    ERROR: 'Documentation data loading filed with error'
};

var authors,
    translators,
    tags,
    tagUrls = {};

module.exports = {

    /**
     * Load documentation data and fill the application model
     * @param nodesWithSource - {Array} array of sources with docs data
     * @returns {*}
     */
    load: function(nodesWithSource) {
        logger.info(MSG.INFO.START);

        /**
         * Success callback for data loading
         * @param content - {Object} loaded and parsed content
         * @returns {*}
         */
        var onSuccess = function(content) {
            authors = content.authors; //set authors
            translators = content.translators; //set translators
            tags = content.tags; //set tags

            //set loaded docs as content of source for nodes
            nodesWithSource.forEach(function(node) {
                config.get('app:languages').forEach(function(lang) {
                    if(node.source[lang]) {
                        var f = _.find(content.docs, function(item) {
                            return item.id === node.source[lang].content;
                        });

                        node.source[lang].content = f && f.source;
                    }
                });
            });

            logger.info(MSG.INFO.SUCCESS);
            return nodesWithSource;
        };

        /**
         * Error callback for data loading
         * Simply log error message
         */
        var onError = function() {
            logger.error(MSG.ERROR);
        };

        return generic.load('data:docs').then(onSuccess, onError);
    },

    /**
     * Returns array of collected authors from docs meta-information without duplicates
     * @returns {Array}
     */
    getAuthors: function() {
        return authors;
    },

    /**
     * Returns array of collected translators from docs meta-information without duplicates
     * @returns {Array}
     */
    getTranslators: function() {
        return translators;
    },

    /**
     * Returns array of collected tags from docs meta-information without duplicates
     * @returns {Array}
     */
    getTags: function() {
        return tags;
    },

    getTagUrls: function() {
        return tagUrls;
    }
};







