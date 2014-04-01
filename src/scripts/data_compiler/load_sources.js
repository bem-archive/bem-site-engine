var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),
    md = require('marked'),

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
    run: function (nodesWithSource, sourceRouteHash) {
        logger.info(MSG.INFO.START);

        var collected = {
                authors: [],
                translators: [],
                tags: []
            },
            promises = nodesWithSource.map(function (node) {
                var _promises = config.get('app:languages').map(function (lang) {
                    return analyzeMetaInformation(node, lang, collected)
                        .then(function (res) {
                            return loadMDFile(res.node, lang, res.repo, sourceRouteHash);
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
 * urls of nodes as values
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
                ref:  parsedSource[5],
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
var loadMDFile = function(node, lang, repo, sourceRouteHash) {
    var renderer = new md.Renderer();

    /**
     * Replace relative links in md documents to app route links or absolute links to github sources
     * @param href - {String} href string
     * @param title - {String} href title
     * @param text - {String} href text
     * @returns {String} result string for a link
     */
    renderer.link = function(href, title, text) {

        try {
            if (href.indexOf('http://') === -1 && href.indexOf('https://') === -1) {

                href = href.replace(/^\.?\.?\//, '');

                href = ['blob', 'tree'].reduce(function(prev, item) {
                    prev = u.format('https://%s/%s/%s/%s/%s/', repo.host, repo.user, repo.repo, item, repo.ref) + href;

                    if (sourceRouteHash[prev]) {
                        prev = sourceRouteHash[prev];
                    }

                    return prev;
                }, '');
            }
        }catch(err) {
            logger.warn('Error occured while link replacement %s', href);
        }

        var out = '<a href="' + href + '"';
        if(title) {
            out += ' title="' + title + '"';
        }
        out += '>' + text + '</a>';
        return out;
    };

    /**
     * Fix marked issue with cyrillic symbols replacing
     * @param text - {String} test of header
     * @param level - {Number} index of header
     * @param raw
     * @param options - {Object} options
     * @returns {String} - result header string
     */
    renderer.heading = function(text, level, raw, options) {
        var specials = ['-','[',']','/','{','}','(',')','*','+','?','.','\\','^','$','|','\ ','\'','\"'];

        options.headerPrefix = options.headerPrefix || '';

        return '<h' + level + ' id="' + options.headerPrefix
            + raw.toLowerCase().replace(RegExp('[' + specials.join('\\') + ']', 'g'), '-') + '">'
            + text + '</h' + level + '>\n';
    };

    return common.loadData(common.PROVIDER_GITHUB_API, { repository: repo })
        .then(function(md) {
            try {
                if(!md.res) {
                    logger.warn(MSG.WARN.MD_NOT_EXIST, lang, node.title);
                    md = null;
                }else {
                    md = (new Buffer(md.res.content, 'base64')).toString();
                    md = util.mdToHtml(md, { renderer: renderer });
                }
            } catch(err) {
                logger.warn(MSG.WARN.MD_PARSING_ERROR, lang, node.title);
                md = null;
            }

            return md;
        });
};
