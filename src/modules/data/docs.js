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
    }
};

var authors,
    translators,
    tags,
    tagUrls = {};

module.exports = {

    load: function(nodesWithSource) {
        logger.info(MSG.INFO.START);

        return generic.load('data:docs:disk', 'data:docs:file')
            .then(function(content) {
                authors = content.authors;
                translators = content.translators;
                tags = content.tags;

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
            });
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







