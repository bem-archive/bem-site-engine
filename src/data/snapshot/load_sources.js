var p = require('path'),
    u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),
    md = require('marked'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    util = require('../lib/util'),
    renderer = require('../lib/renderer'),
    providers = require('../providers');

/**
 * Loads sources for nodes
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
module.exports = function(obj) {
    logger.info('Load sources for nodes start');

    var languages = config.get('common:languages'),
        collected = {
            authors: [],
            translators: [],
            tags: {}
        },
        promises = util
            .findNodesByCriteria(obj.sitemap, function() { return this.source; }, false)
            .map(function (node) {
                return vow.all(languages.map(function (lang) {
                    return analyzeMetaInformation(node, lang, collected)
                        .then(function(res) {
                            return loadMDFile(res.node, lang, res.repo);
                        })
                        .then(function(res) {
                            if(res) {
                                node.source[lang].url = node.source[lang].content;
                                node.source[lang].content = res;
                            }
                        });
                }));
            });

    return vow.all(promises).then(function() {
        obj.docs = collected;
        return obj;
    });
};

/**
 * Analizes source for node, transform values and create repo links
 * @param node - {Object} node
 * @param lang - {String} language of source
 * @param collected - {Object} result target object
 * urls of nodes as values
 * @returns {*}
 */
var analyzeMetaInformation = function(node, lang, collected) {

    if(!node.source[lang]) {
        logger.warn('source with lang %s does not exists for node with url %s', lang, node.url);
        node.source[lang] = null;
        return vow.resolve({ node: node, repo: null });
    }

    try {
        var meta = node.source[lang],
            content = meta.content,
            repo;

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
            collected.tags[lang] = collected.tags[lang] || [];
            collected.tags[lang] = _.union(collected.tags[lang], meta.tags);
        }

        //check for existing content
        if(!content) {
            var isContentExistsForAnyOtherLang = Object.keys(node.source).some(function(_lang) {
                return _lang !== lang && node.source[_lang] && node.source[_lang].content;
            });

            if(isContentExistsForAnyOtherLang) {
                return vow.resolve({ node: node, repo: null });
            }else{
                logger.error('Content were not set for any lang for node %s', node.url);
                node.source[lang] = null;
                return vow.reject();
            }
        }

        repo = (function(_source) {
            var re = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/,
                parsedSource = _source.match(re);
            return {
                host: parsedSource[1],
                user: parsedSource[2],
                repo: parsedSource[3],
                ref:  parsedSource[5],
                path: parsedSource[6]
            };
        })(content);

        repo.type = repo.host.indexOf('github.com') > -1 ? 'public' : 'private';
        repo.issue = u.format("https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"",
            repo.host, repo.user, repo.repo, meta.title);
        repo.prose = u.format("http://prose.io/#%s/%s/edit/%s/%s",
            repo.user, repo.repo, repo.ref, repo.path);

        //set repo information for issues and prose.io links
        node.source[lang].repo = repo;

        return vow.resolve({ node: node, repo: repo });
    }catch(err) {
        logger.error('source for lang %s contains errors for node %s', lang, node.url);
        node.source[lang] = null;
        return vow.reject();
    }
};

/**
 * Loads *.md file for source of node
 * @param node - {Object} node of sitemap model
 * @param lang - {String} language key
 * @param repo - {Object} repository object
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
var loadMDFile = function(node, lang, repo) {
    var title = (node.title && node.title[lang]) ? node.title[lang] : node.title;

    if(!repo) {
        return vow.resolve(null);
    }

    return providers.getProviderGhApi()
        .load({ repository: repo })
        .then(
            function(md) {
                try {
                    return util.mdToHtml((new Buffer(md.res.content, 'base64')).toString(),
                        { renderer: renderer.getRenderer() });
                }catch(err) {
                    var errorMsg = !md.res ?
                            u.format('markdown with lang %s does not exists for node %s', lang, title) :
                            u.format('markdown for lang %s contains errors for node %s', lang, title);
                    logger.error(errorMsg);
                    return vow.reject(errorMsg);
                }
            }
        )
        .fail(function() {
            var errorMsg = u.format('markdown with lang %s does not exists for node %s', lang, title);
            logger.error(errorMsg);
            return vow.reject(errorMsg);
        });
};
