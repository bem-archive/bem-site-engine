var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    util = require('../../util'),
    data = require('../../modules/data'),
    common = data.common;

var MSG = {
    INFO: {
        START: 'Load sources for nodes start',
        SUCCESS: 'All loading operations for docs have been performed successfully'
    },
    WARN: {
        META_NOT_EXIST: 'source with lang %s does not exists for node %s',
        MD_NOT_EXIST: 'markdown with lang %s does not exists for node %s',
        META_PARSING_ERROR: 'source for lang %s contains errors for node %s',
        MD_PARSING_ERROR: 'markdown for lang %s contains errors for node %s',
        DEPRECATED: 'remove deprecated field %s for source user: %s repo: %s ref: %s path: %s'
    },
    ERROR: 'Error occur while loading sources'
};


/**
 * Loads sources for nodes
 * @param nodesWithSource - {Array} sources with nodes
 * @returns {*|Q.IPromise<U>|Q.Promise<U>}
 */
module.exports = {
    run: function (nodesWithSource) {
        logger.info(MSG.INFO.START);

        var collected = {
            authors: [],
            translators: [],
            tags: []
        };

        var LANGS = config.get('app:languages');

        var promises = nodesWithSource.map(function (node) {
            var _promises = LANGS.map(function (lang) {
                return analyzeMetaInformation(node, lang, collected)
                    .then(function (res) {
                        return loadMDFile(res.node, lang, res.repo);
                    })
                    .then(function (res) {
                        node.source[lang].url = node.source[lang].content;
                        node.source[lang].content = res;
                    });
            });

            return vow.allResolved(_promises);
        });

        return vow
            .all(promises)
            .then(
                function () {
                    logger.info(MSG.INFO.SUCCESS);
                    return collected;
                },
                function () {
                    logger.error(MSG.ERROR);
                }
            );
    }
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
            var re = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/,
                parsedSource = _source.match(re);
            return {
                host: parsedSource[1],
                user: parsedSource[2],
                repo: parsedSource[3],
                ref: parsedSource[5],
                path: parsedSource[6]
            };
        })(content);

        repo.type = repo.host === 'github.yandex-team.ru' ? 'private' : 'public';

        //set repo information for issues and prose.io links
        node.source[lang].repo = {
            type: repo.type,
            issue: u.format("https://%s/%s/%s/issues/new?title=Feedback+for+\"%s\"", repo.host, repo.user, repo.repo, meta.title),
            prose: u.format("http://prose.io/#%s/%s/edit/%s/%s",repo.user, repo.repo, repo.ref, repo.path)
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
