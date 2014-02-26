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
    WARN: {
        META_NOT_EXIST: 'source with lang %s does not exists for node %s',
        MD_NOT_EXIST: 'markdown with lang %s does not exists for node %s',
        META_PARSING_ERROR: 'source for lang %s contains errors for node %s',
        MD_PARSING_ERROR: 'markdown for lang %s contains errors for node %s',
        DEPRECATED: 'remove deprecated field %s for source user: %s repo: %s ref: %s path: %s'
    }
};

module.exports = {
    run: function(modelPath) {
        logger.info('-- sitemap_compiler module start --');

        var _sitemap;

        data.common.init();

        getSitemap(modelPath)
            .then(function(sitemap) {
                _sitemap = sitemap;
                return collectNodesWithSource(sitemap);
            })
            .then(function(nodeWithSources) {
                return loadSourcesForNodes(nodeWithSources);
            })
            .then(function(docs) {
                return vow.all([
                    saveAndUploadSitemap(_sitemap),
                    saveAndUploadDocs(docs)
                ]);
            })
            .then(
                function() {
                    logger.info('-- sitemap_compiler successfully finished --');
                },
                function() {
                    logger.error('Error occur while compile models and loading dicumentation');
                }
            );
    }
};

/**
 * Resolves sitemap js model
 * @returns {*|Q.Promise<T>}
 */
var getSitemap  = function(modelPath) {
    logger.debug('Get sitemap start');

    var def = vow.defer(),
        sitemap;
    try {
        sitemap = require(modelPath).get();
        def.resolve(sitemap);

        logger.debug('Sitemap js model has been loaded successfully');
    }catch(err) {
        logger.error('Can not resolve valid sitemap js model');
        def.reject(err.message);
    }
    return def.promise();
};

/**
 * Collect nodes that have sources
 * @param sitemap - {Object} sitemap model
 * @returns {Array} - array of nodes
 */
var collectNodesWithSource = function(sitemap) {
    logger.debug('Collect nodes with source start');

    var nodesWithSource = [];

    try {
        /**
         * Recursive function for traversing tree model
         * @param node {Object} - single node of sitemap model
         */
        var traverseTreeNodes = function(node) {

            if(node.source) {
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

        logger.debug('Collect nodes with source successfully finished');
    }catch(err) {
        logger.error('Can not traverse throught sitemap model and extrude source nodes');
    }

    return nodesWithSource;
};

var loadSourcesForNodes = function(nodesWithSource) {
    logger.debug('Load sources for nodes start');

    var collected = {
        docs: [],
        authors: [],
        translators: [],
        tags: []
    };

    var LANG = {
        EN: 'en',
        RU: 'ru'
    };

    var promises = nodesWithSource.map(function(node) {
        return vow.allResolved({
            en: analyzeMetaInformation(node, LANG.EN, collected)
                .then(function(res) {
                    return loadMDFile(res.node, LANG.EN, res.repo);
                })
                .then(function(res) {
                    logger.verbose('Collect source for key %s', node.source[LANG.EN].content);
                    collected.docs.push({
                        id: node.source[LANG.EN].content,
                        source: res
                    });
                })
            ,
            ru: analyzeMetaInformation(node, LANG.RU, collected)
                .then(function(res) {
                    return loadMDFile(res.node, LANG.RU, res.repo);
                })
                .then(function(res) {
                    logger.verbose('Collect source for key %s', node.source[LANG.RU].content);
                    collected.docs.push({
                        id: node.source[LANG.RU].content,
                        source: res
                    });
                })
        })
    });

    return vow.allResolved(promises).then(function() {
        logger.debug('All loading operations for docs have been performed');
        return collected;
    });
};

var analyzeMetaInformation = function(node, lang, collected) {

    var def = vow.defer();

    if(!node.source[lang]) {
        logger.warn(MSG.WARN.META_NOT_EXIST, lang, node.title && (node.title[lang] || node.title));
        node.source[lang] = null;

        def.reject();
        return def.promise();
    }

    try {
        var meta = node.source[lang];

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.createDate) {
            meta.createDate = util.dateToMilliseconds(meta.createDate);
        }

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.editDate) {
            node.source[lang].editDate = util.dateToMilliseconds(meta.editDate);
        }

        //compact and collect authors
        if(meta.authors && _.isArray(meta.authors)) {
            meta.authors = _.compact(meta.authors);
            node.source[lang].authors = meta.authors;
            collected.authors = _.union(collected.authors, meta.authors);
        }

        //compact and collect translators
        if(meta.translators && _.isArray(meta.translators)) {
            meta.translators = _.compact(meta.translators);
            node.source[lang].translators = meta.translators;
            collected.translators = _.union(collected.translators, meta.translators);
        }

        //collect tags
        if(meta.tags) {
            collected.tags = _.union(collected.tags, meta.tags);
        }

        var content = meta.content;

        var repo = (function(_source) {
            var re = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/tree\/(.+?)\/(.+)/,
                parsedSource = _source.match(re);
            return {
                host: parsedSource[1],
                user: parsedSource[2],
                repo: parsedSource[3],
                ref: parsedSource[4],
                path: parsedSource[5]
            };
        })(content);

        //logger.verbose('get repo from source user: %s repo: %s ref: %s path: %s',
        //    repo.user, repo.repo, repo.ref, repo.path);

        //set repo information for issues and prose.io links
        node.source[lang].repo = {
            issue: u.format("https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"",
                repo.host, repo.user, repo.repo, meta.title),
            prose: u.format("http://prose.io/#%s/%s/edit/%s/%s",
                repo.user, repo.repo, repo.ref, repo.path)
        };

        def.resolve({ node: node, repo: repo });

    }catch(err) {
        logger.warn(MSG.WARN.META_PARSING_ERROR, lang, node.title && (node.title[lang] || node.title));

        node.source[lang] = null;
        def.reject();
    }

    return def.promise();
};

/**
 * Loads *.md file for source of node
 * @param node - {Object} node of sitemap model
 * @param lang - {String} language key
 * @param repo - {Object} repository object
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadMDFile = function(node, lang, repo) {
    return common.loadData(common.PROVIDER_GITHUB_API, { repository: repo })
        .then(function(md) {
            try {
                if(!md.res) {
                    logger.warn(MSG.WARN.MD_NOT_EXIST, lang, node.title);
                    md = null;
                }else {
                    md = (new Buffer(md.res.content, 'base64')).toString();
                    md = util.mdToHtml(md);
                }
            } catch(err) {
                logger.warn(MSG.WARN.MD_PARSING_ERROR, lang, node.title);
                md = null;
            }

            return md;
        });
};

/**
 * Saves docs object into *.json file in dev enviroment
 * or upload it to Yandex Disk in production enviroment
 * @param docs - {Object} object with fields:
 * - id {String} link to md file
 * - source {Object} source of node
 * @param collected - {Object} object with fields:
 * - authors {Array} - array of unique authors
 * - translators {Array} - array of unique translators
 * - tags {Array} - array of unique tags
 */
var saveAndUploadDocs = function(content) {
    logger.debug('Save documentation to file or upload it to Yandex Disk');

    if ('production' === process.env.NODE_ENV) {
        return common.saveData(common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:docs:disk'),
            data: JSON.stringify(content, null, 4)
        });
    }else {
        return common.saveData(common.PROVIDER_FILE, {
            path: config.get('data:docs:file'),
            data: content
        });
    }
};

/**
 * Saves sitemap model object into *.json file in dev enviroment
 * or upload it to Yandex Disk in production enviroment
 * @param sitemap - {Object} sitemap model
 * @returns {*}
 */
var saveAndUploadSitemap = function(sitemap) {
    logger.debug('Save sitemap to file or upload it to Yandex Disk');

    if ('production' === process.env.NODE_ENV) {
        return common.saveData(common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:sitemap:disk'),
            data: JSON.stringify(sitemap, null, 4)
        });
    }else {
        return common.saveData(common.PROVIDER_FILE, {
            path: config.get('data:sitemap:file'),
            data: sitemap
        });
    }
};


