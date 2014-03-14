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
    DEBUG: {
        SAVE_DATA: {
            FILE_SUCCESS: 'Data has been saved to file %s',
            DISK_SUCCESS: 'Data has been saved to yandex disk %s'
        }
    },
    INFO: {
        START: '-- sitemap_compiler module start --',
        END: '-- sitemap_compiler successfully finished --',
        SITE_MAP: {
            START: 'Get sitemap start',
            SUCCESS: 'Sitemap js model has been loaded successfully'
        },
        COLLECT_SOURCE: {
            START: 'Collect nodes with source start',
            SUCCESS: 'Collect nodes with source successfully finished'
        },
        COLLECT_LIBRARY: {
            START: 'Collect library nodes start',
            SUCCESS: 'Collect library nodes successfully finished'
        },
        LOAD_SOURCES: {
            START: 'Load sources for nodes start',
            SUCCESS: 'All loading operations for docs have been performed successfully'
        },
        SAVE_DATA: {
            START: 'Save data to file %s or upload it to Yandex Disk %s'
        }
    },
    WARN: {
        META_NOT_EXIST: 'source with lang %s does not exists for node %s',
        MD_NOT_EXIST: 'markdown with lang %s does not exists for node %s',
        META_PARSING_ERROR: 'source for lang %s contains errors for node %s',
        MD_PARSING_ERROR: 'markdown for lang %s contains errors for node %s',
        DEPRECATED: 'remove deprecated field %s for source user: %s repo: %s ref: %s path: %s'
    },
    ERROR: {
        FINAL: 'Error occur while compile models and loading documentation',
        SITEMAP_RESOLVE: 'Can not resolve valid sitemap js model',
        COLLECT_SOURCE: 'Can not traverse through sitemap model and extrude source nodes',
        COLLECT_LIBRARY: 'Can not traverse through sitemap model and extrude source nodes',
        LOAD_SOURCES: 'Error occur while loading sources',
        SAVE_DATA: {
            DISK: 'Error occur while saving data to yandex disk %s',
            FILE: 'Error occur while saving data to file %s'
        }
    }
};

module.exports = {
    run: function(modelPath) {
        logger.info(MSG.INFO.START);

        var _sitemap;

        data.common.init();

        getSitemap(modelPath)
            .then(function(sitemap) {
                _sitemap = sitemap;
                return vow.all([
                    collectSourceNodes(sitemap),
                    collectLibraryNodes(sitemap)
                ]);
            })
            .spread(function(sources, libraries) {
                return vow.all([
                    loadSources(sources),
                    loadLibraries(libraries)
                ]);
            })
            .spread(function(docs, libraries) {
                return vow
                    .all([
                        saveAndUpload(_sitemap, {
                            disk: 'data:sitemap:disk',
                            file: 'data:sitemap:file'
                        }),
                        saveAndUpload(docs, {
                            disk: 'data:docs:disk',
                            file: 'data:docs:file'
                        }),
                        saveAndUpload(libraries, {
                            disk: 'data:libraries:disk',
                            file: 'data:libraries:file'
                        })
                    ])
                    .then(function() {
                        return createUpdateMarker(_sitemap, docs, libraries);
                    })
            })
            .then(
                function() {
                    logger.info(MSG.INFO.END);
                },
                function() {
                    logger.error(MSG.ERROR.FINAL);
                }
            );
    }
};

/**
 * Resolves sitemap js model
 * @returns vow promise
 */
var getSitemap  = function(modelPath) {
    logger.info(MSG.INFO.SITE_MAP.START);

    var def = vow.defer();

    try {
        def.resolve(require(modelPath).get());
        logger.info(MSG.INFO.SITE_MAP.SUCCESS);
    }catch(err) {
        def.reject(err.message);
        logger.error(MSG.ERROR.SITEMAP_RESOLVE);
    }
    return def.promise();
};

/**
 * Collect nodes that have sources
 * @param sitemap - {Object} sitemap model
 * @returns {Array} - array of nodes
 */
var collectSourceNodes = function(sitemap) {
    logger.info(MSG.INFO.COLLECT_SOURCE.START);

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

        logger.info(MSG.INFO.COLLECT_SOURCE.SUCCESS);
    }catch(err) {
        logger.error(MSG.ERROR.COLLECT_SOURCE);
    }

    return nodesWithSource;
};

/**
 * Collect library nodes
 * @param sitemap - {Object} sitemap model
 * @returns {Array} - array of nodes
 */
var collectLibraryNodes = function(sitemap) {
    logger.info(MSG.INFO.COLLECT_LIBRARY.START);

    var libraryNodes = [];

    try {
        /**
         * Recursive function for traversing tree model
         * @param node {Object} - single node of sitemap model
         */
        var traverseTreeNodes = function(node) {

            if(node.lib) {
                libraryNodes.push(node);
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

        logger.info(MSG.INFO.COLLECT_LIBRARY.SUCCESS);
    }catch(err) {
        logger.error(MSG.ERROR.COLLECT_LIBRARY);
    }

    return libraryNodes;
};

/**
 * Loads sources for nodes
 * @param nodesWithSource - {Array} sources with nodes
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadSources = function(nodesWithSource) {
    logger.info(MSG.INFO.LOAD_SOURCES.START);

    var collected = {
        docs: [],
        authors: [],
        translators: [],
        tags: []
    };

    var LANGS = ['en', 'ru'];

    var promises = nodesWithSource.map(function(node) {
        var _promises = LANGS.map(function(lang) {
            return analyzeMetaInformation(node, lang, collected)
                .then(function(res) {
                    return loadMDFile(res.node, lang, res.repo);
                })
                .then(function(res) {
                    collected.docs.push({
                        id: node.source[lang].content,
                        source: res
                    });
                });
        });

        return vow.allResolved(_promises);
    });

    return vow.all(promises)
        .then(
            function() {
                logger.info(MSG.INFO.LOAD_SOURCES.SUCCESS);
                return collected;
            },
            function() {
                logger.error(MSG.ERROR.LOAD_SOURCES);
            }
        );
};

/**
 * Analizes source for node, transform values and create repo links
 * @param node - {Object} node
 * @param lang - {String} language of source
 * @param collected - {Object} result target object
 * @returns {*}
 */
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

        repo.type = repo.host === 'github.yandex-team.ru' ? 'private' : 'public';

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
 * Load libraries for nodes
 * @param libraryNodes - {Array} array with nodes linked with libraries
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadLibraries = function(libraryNodes) {
    var libraries = {};
    return vow.all(
            libraryNodes.map(function(node) {
                return loadLibraryVersions(config.get('github:librariesRepository'), node, libraries);
            })
        )
        .then(function() {
            return libraries;
        });
};

/**
 * Load data for single version of library
 * @param repo - {Object} libraries repository
 * @param node - {BaseNode} node
 * @param libraries - {Object} libraries hash
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadLibraryVersions = function(repo, node, libraries) {
    libraries[node.lib] = libraries[node.lib] || {};

    return common
        .loadData(common.PROVIDER_GITHUB_API, { repository: _.extend({ path: node.lib }, repo) })
        .then(function(result) {
            var promises = result.res.map(function(version) {
                var _path = u.format('%s/%s/data.json', node.lib, version.name);
                return common
                    .loadData(common.PROVIDER_GITHUB_HTTPS, { repository: _.extend({ path: _path }, repo) })
                    .then(function(result) {
                        libraries[node.lib][version.name] = result;
                    });
            });

            return vow.all(promises);
        });
};

/**
 * Saves data object into *.json file in dev enviroment
 * or upload it to Yandex Disk in production enviroment
 * @param content - {Object} object with should be saved
 * @returns {*}
 */
var saveAndUpload = function(content, _path) {
    logger.info(MSG.INFO.SAVE_DATA.START, config.get(_path.file), config.get(_path.disk));

    var saveToYandexDisk = function() {
            return common
                .saveData(common.PROVIDER_YANDEX_DISK, {
                    path: config.get(_path.disk),
                    data: JSON.stringify(content)
                })
                .then(
                    function() {
                        logger.debug(MSG.DEBUG.SAVE_DATA.DISK_SUCCESS, config.get(_path.disk));
                    },
                    function() {
                        logger.error(MSG.ERROR.SAVE_DATA.DISK, config.get(_path.disk));
                    }
                );
        },
        saveToLocalFile = function() {
            return common
                .saveData(common.PROVIDER_FILE, {
                    path: config.get(_path.file),
                    data: content,
                    minimize: true
                })
                .then(
                    function() {
                        logger.debug(MSG.DEBUG.SAVE_DATA.FILE_SUCCESS, config.get(_path.file));
                    },
                    function() {
                        logger.error(MSG.ERROR.SAVE_DATA.FILE, config.get(_path.file));
                    }
                );
        };

    if ('production' === process.env.NODE_ENV) {
        return saveToYandexDisk();
    }else {
        return saveToLocalFile();
    }
};

/**
 * Create small json file with hashes from sitemap, docs, libraries and people data
 * It will be checked by application in runtime
 * @param sitemap - {Object} sitemap object
 * @param docs - {Object} documentation object
 * @param libraries - {Object} library object
 * @returns {*}
 */
var createUpdateMarker = function(sitemap, docs, libraries) {
    logger.debug('Create update marker start');

    var marker = {
        sitemap: sha(JSON.stringify(sitemap)),
        docs: sha(JSON.stringify(docs)),
        libraries: sha(JSON.stringify(libraries))
    };

    if ('production' === process.env.NODE_ENV) {
        return common.saveData(common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:marker:disk'),
            data: JSON.stringify(marker, null, 4)
        });
    }else {
        return common.saveData(common.PROVIDER_FILE, {
            path: config.get('data:marker:file'),
            data: marker,
            minimize: false
        });
    }
};