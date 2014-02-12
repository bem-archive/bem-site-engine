var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    util = require('../../util'),
    data = require('../data'),
    common = data.common;

var MSG = {
    ERR: {
        NOT_EXIST: '%s file does not exist for source user: %s repo: %s ref: %s path: %s',
        PARSING_ERROR: '%s file parsed with error for source user: %s repo: %s ref: %s path: %s'
    },
    WARN: {
        DEPRECATED: 'remove deprecated field %s for source user: %s repo: %s ref: %s path: %s'
    }
};

var BACKUP = {
    FILE: {
        DIRECTORY: 'backups',
        DOCS: 'docs.json'
    },
    YANDEX_DISK: {
        DIRECTORY: 'docs',
        DOCS: 'docs.json'
    }
};

module.exports = {
    run: function() {
        logger.info('Collect docs start');

        data.common.init();

        return common.loadData(common.PROVIDER_FILE, {
            path: path.join('configs', 'common', 'sitemap.json')
        })
        .then(collectNodesWithSource)
        .then(loadSourcesForNodes)
        .then(
            function() {
                logger.info('Collect docs end successfully');
            },
            function() {
                logger.error('Error occur while saving and uploading data');
            }
        );
    }
};

/**
 * Collect nodes that have sources
 * @param sitemap - {Object} sitemap model
 * @returns {Array} - array of nodes
 */
var collectNodesWithSource = function(sitemap) {

    var nodesWithSource = [];

    /**
     * Recursive function for traversing tree model
     * @param node {Object} - single node of sitemap model
     */
    var traverseTreeNodes = function(node) {

        if(node.source) {
            node.id = sha(JSON.stringify(node))
            nodesWithSource.push(node);
        }

        if(node.items) {
            node.items.forEach(function(item) {
                traverseTreeNodes(item);
            });
        }
    };

    sitemap.forEach(function(item) {
        traverseTreeNodes(item);
    });

    return nodesWithSource;
};

var loadSourcesForNodes = function(nodesWithSource) {
    logger.info('Load all docs start');

    var collected = {
        authors: [],
        translators: [],
        tags: []
    };

    var promises = nodesWithSource.map(function(node){
        logger.verbose('Load source for node with url %s %s', node.url, node.source);

        return vow
            .allResolved({
                metaEn: common.loadData(common.PROVIDER_GITHUB_API, {
                    repository: util.getRepoFromSource(node.source, 'en.meta.json')
                }),
                metaRu: common.loadData(common.PROVIDER_GITHUB_API, {
                    repository: util.getRepoFromSource(node.source, 'ru.meta.json')
                }),
                mdEn: common.loadData(common.PROVIDER_GITHUB_API, {
                    repository: util.getRepoFromSource(node.source, 'en.md')
                }),
                mdRu: common.loadData(common.PROVIDER_GITHUB_API, {
                    repository: util.getRepoFromSource(node.source, 'ru.md')
                })
            })
            .then(function(value) {
                return {
                    id: node.id,
                    source: {
                        en: getSourceFromMetaAndMd(value.metaEn._value, value.mdEn._value, collected),
                        ru: getSourceFromMetaAndMd(value.metaRu._value, value.mdRu._value, collected)
                    }
                };
            });
    });

    return vow.allResolved(promises).then(function(docs) {
        return saveAndUploadDocs(docs, collected);
    });
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
var getSourceFromMetaAndMd = function(meta, md, collected) {
    var repo = meta.repo;

    logger.verbose('loaded data from repo user: %s repo: %s ref: %s path: %s', repo.user, repo.repo, repo.ref, repo.path);

    //verify if md file content exists and valid
    try {
        if(!md.res) {
            logger.warn(MSG.ERR.NOT_EXIST, 'md', repo.user, repo.repo, repo.ref, repo.path);
            md = null;
        }else {
            _.extend(repo, { path: md.res.path });
            md = (new Buffer(md.res.content, 'base64')).toString();
            md = util.mdToHtml(md);
        }
    } catch(err) {
        logger.warn(MSG.ERR.PARSING_ERROR, 'md', repo.user, repo.repo, repo.ref, repo.path);
        md = null;
    }

    //verify if meta.json file content exists and valid
    try {
        if(!meta.res) {
            logger.warn(MSG.ERR.NOT_EXIST, 'meta', repo.user, repo.repo, repo.ref, repo.path);
            return null;
        }

        meta = (new Buffer(meta.res.content, 'base64')).toString();
        meta = JSON.parse(meta);

    } catch(err) {
        logger.warn(MSG.ERR.PARSING_ERROR, 'meta', repo.user, repo.repo, repo.ref, repo.path);
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
        collected.authors = _.union(collected.authors, meta.authors);
    }

    //collect translators
    if(meta.translators && _.isArray(meta.translators)) {
        meta.translators = _.compact(meta.translators);
        collected.translators = _.union(collected.translators, meta.translators);
    }

    //collect tags
    if(meta.tags) {
        collected.tags = _.union(collected.tags, meta.tags);
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

/**
 * Creates backup object, save it into json file and
 * upload it via yandex disk api
 * @param docs - {Object} object with fields:
 * - id {String} unique id of node
 * - source {Object} source of node
 * @param collected - {Object} object with fields:
 * - authors {Array} - array of unique authors
 * - translators {Array} - array of unique translators
 * - tags {Array} - array of unique tags
 */
var saveAndUploadDocs = function(docs, collected) {
    logger.info('save documentation to file and upload it');

    var content = {
        docs: docs.reduce(function(prev, item) {
            item = item._value || item;

            prev[item.id] = item.source;
            return prev;
        }, {}),
        authors: collected.authors,
        translators: collected.translators,
        tags: collected.tags
    };

    return vow.all([
        common.saveData(common.PROVIDER_FILE, {
            path: path.join(BACKUP.FILE.DIRECTORY, BACKUP.FILE.DOCS),
            data: content
        }),
        common.saveData(common.PROVIDER_YANDEX_DISK, {
            path: path.join(BACKUP.YANDEX_DISK.DIRECTORY, BACKUP.YANDEX_DISK.DOCS),
            data: JSON.stringify(content, null, 4)
        })
    ]);
};


