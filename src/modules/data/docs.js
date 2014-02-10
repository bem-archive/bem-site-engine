'use strict';

var u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    util = require('../../util'),
    logger = require('../../logger')(module),

    common = require('./common');

var collectedAuthors = [],
    collectedTranslators = [],
    collectedTags = [],

    tagUrls = {};

var MSG = {
    ERR: {
        NOT_EXIST: '%s file does not exist for source user: %s repo: %s ref: %s path: %s',
        PARSING_ERROR: '%s file parsed with error for source user: %s repo: %s ref: %s path: %s'
    },
    WARN: {
        DEPRECATED: 'remove deprecated field %s for source user: %s repo: %s ref: %s path: %s'
    }
};

module.exports = {

    load: function(nodesWithSource) {
        logger.info('Load all docs start');

        var promises = nodesWithSource.map(function(node){
            logger.verbose('Load source for node with url %s %s', node.url, node.source);

            return vow
                .allResolved({
                    metaEn: common.loadData(
                        common.getRepoFromSource(node.source, 'en.meta.json'), common.PROVIDER_GITHUB_API),
                    metaRu: common.loadData(
                        common.getRepoFromSource(node.source, 'ru.meta.json'), common.PROVIDER_GITHUB_API),
                    mdEn: common.loadData(
                        common.getRepoFromSource(node.source, 'en.md'), common.PROVIDER_GITHUB_API),
                    mdRu: common.loadData(
                        common.getRepoFromSource(node.source, 'ru.md'), common.PROVIDER_GITHUB_API)
                })
                .then(function(value) {
                    var _def = vow.defer();

                    node.source = {
                        en: getSourceFromMetaAndMd(value.metaEn._value, value.mdEn._value),
                        ru: getSourceFromMetaAndMd(value.metaRu._value, value.mdRu._value)
                    };

                    _def.resolve({ id: node.id, source: node.source });
                    return _def.promise();
                });
        });

        return vow.allResolved(promises)
            .then(function(res) {
                //backup loaded data into file
                return common.saveData(res.reduce(function(prev, item) {
                        prev[item._value.id] = item._value.source;
                        return prev;
                    }, {}), common.PROVIDER_FILE);
            });
    },

    reloadAll: function() {
        logger.info('Reload all resources start');
        //TODO implement this
    },

    reload: function(source) {
        logger.info('Reload resource %s start', source);
        //TODO implement this
    },

    getAuthors: function() {
        return collectedAuthors;
    },

    getTranslators: function() {
        return collectedTranslators;
    },

    getTags: function() {
        return collectedTags;
    },

    getTagUrls: function() {
        return tagUrls;
    }
};

/**
 * Post-processing meta-information and markdown contents
 * Merge them into one object.
 * Remove deprecated fields from meta-information
 * Collect tags, authors and translators for advanced people loading
 * Create url for repo issues and prose.io
 * @param meta - {Object} object with .meta.json file information
 * @param md - {Object} object with .md file information
 * @returns {*}
 */
var getSourceFromMetaAndMd = function(meta, md) {
    var repo = meta.repo;

    logger.verbose('loaded data from repo user: %s repo: %s ref: %s path: %s', repo.user, repo.repo, repo.ref, repo.path);

    //verify if md file content exists and valid
    try {
        if(!md.res) {
            logger.error(MSG.ERR.NOT_EXIST, 'md', repo.user, repo.repo, repo.ref, repo.path);
            md = null;
        }else {
            _.extend(repo, { path: md.res.path });
            md = (new Buffer(md.res.content, 'base64')).toString();
            md = util.mdToHtml(md);
        }
    } catch(err) {
        logger.error(MSG.ERR.PARSING_ERROR, 'md', repo.user, repo.repo, repo.ref, repo.path);
        md = null;
    }

    //verify if meta.json file content exists and valid
    try {
        if(!meta.res) {
            logger.error(MSG.ERR.NOT_EXIST, 'meta', repo.user, repo.repo, repo.ref, repo.path);
            return null;
        }

        meta = (new Buffer(meta.res.content, 'base64')).toString();
        meta = JSON.parse(meta);

    } catch(err) {
        logger.error(MSG.ERR.PARSING_ERROR, 'meta', repo.user, repo.repo, repo.ref, repo.path);
        return null;
    }

    //set md inton content field of meta information
    meta.content = md;

    //parse date from dd-mm-yyyy format into milliseconds
    if(meta.createDate) {
        meta.createDate = util.dateToMilliseconds(meta.createDate);
    }

    //parse date from dd-mm-yyyy format into milliseconds
    if(meta.editDate) {
        meta.editDate = util.dateToMilliseconds(meta.editDate);
    }

    //set repo information
    meta.repo = {
        issue: u.format("https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"",
            repo.host, repo.user, repo.repo, meta.title),
        prose: u.format("http://prose.io/#%s/%s/edit/%s/%s",
            repo.user, repo.repo, repo.ref, repo.path)
    };

    //collect authors
    if(meta.authors && _.isArray(meta.authors)) {
        meta.authors = _.compact(meta.authors);
        collectedAuthors = _.union(collectedAuthors, meta.authors);
    }

    //collect translators
    if(meta.translators && _.isArray(meta.translators)) {
        meta.translators = _.compact(meta.translators);
        collectedTranslators = _.union(collectedTranslators, meta.translators);
    }

    //collect tags
    if(meta.tags) {
        collectedTags = _.union(collectedTags, meta.tags);
    }

    /** fallbacks **/
    ['type', 'root', 'categories', 'order', 'url', 'slug'].forEach(function(field) {
        if(meta[field]) {
            //TODO uncomment it for warnings
            //logger.warn(MSG.WARN.DEPRECATED, field, repo.user, repo.repo, repo.ref, repo.path);
            delete meta[field];
        }
    });
    /** end of fallbacks **/

    return meta;
};







