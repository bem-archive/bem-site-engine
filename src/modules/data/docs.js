'use strict';

var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    util = require('../../util'),
    logger = require('../../logger')(module),
    config = require('../../config'),

    common = require('./common');

var authors,
    translators,
    tags,

    tagUrls = {};

module.exports = {

    load: function(nodesWithSource) {

        var docs;

        if('production' === process.env.NODE_ENV) {
            docs = common.loadData(common.PROVIDER_YANDEX_DISK, {
                    path: config.get('data:docs:disk')
                })
                .then(function(content) {
                    return JSON.parse(content);
                });
        }else {
            docs = common.loadData(common.PROVIDER_FILE, {
                path: config.get('data:docs:file')
            });
        }

        return docs.then(function(content) {
            authors = content.authors;
            translators = content.translators;
            tags = content.tags;

            nodesWithSource.forEach(function(node) {
                node.source = content.docs[node.id];
            });

            return nodesWithSource;
        });
    },

    reload: function(source) {

    },

    /**
     * Returns array of collected authors from docs meta-information without dublicates
     * @returns {Array}
     */
    getAuthors: function() {
        return authors;
    },

    /**
     * Returns array of collected translators from docs meta-information without dublicates
     * @returns {Array}
     */
    getTranslators: function() {
        return translators;
    },

    /**
     * Returns array of collected tags from docs meta-information without dublicates
     * @returns {Array}
     */
    getTags: function() {
        return tags;
    },

    getTagUrls: function() {
        return tagUrls;
    }
};







