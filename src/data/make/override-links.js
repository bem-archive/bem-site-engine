var util = require('util'),
    p = require('path'),

    _ = require('lodash'),

    utility = require('../util'),
    logger = require('../logger');

var REGEXP = {
    LINK: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g,
    RELATIVE: {
        DOC: /^\.?\/?([\w|-]+)\.?[md|html|ru\.md|en\.md]?/,
        VERSION_DOC: /^\.?\/?(\d+\.\d+\.\d+)\-([\w|-]+)?\.?[md|html|ru\.md|en\.md]?/,
        BLOCK: /^\.\.?\/([\w|-]+)\/?([\w|-]+)?\.?[md|html|ru\.md|en\.md]?/,
        BLOCKS: /^\.?\/?([\w|-]+)\.blocks\/([\w|-]+)\/?([\w|-]+)?\.?[md|html|ru\.md|en\.md]?/,
        LEVEL: /^\.\.?\/\.\.\/([\w|-]+)\.blocks\/([\w|-]+)\/?([\w|-]+)?\.?[md|html|ru\.md|en\.md]?/
    }
};

function buildHref(a) {
    return util.format('<a href="%s"', a);
}

/**
 * Check if link is e-mail link
 * @param {String} str link
 * @returns {boolean}
 */
function isMailTo(str) {
    return /^mailto:/.test(str);
}

/**
 * Check if link is simple anchor link
 * @param {String} str link
 * @returns {boolean}
 */
function isAnchor(str) {
    return /^#(.+)?/.test(str);
}

function isAbsolute(str) {
    return /^(https?:)?\/\//.test(str);
}

/**
 * Check if link is simple anchor link
 * @param {String} str link
 * @param {Array} links that are exists in site model
 * @returns {boolean}
 */
function isNativeSiteLink(str, links) {
    return links.indexOf(str.replace(/\/$/, '')) > -1;
}

/**
 * Replace kind of broken links
 * @param {String} str link
 * @returns {String}
 */
function fixBrokenLinkWithAmpersand(str) {
    return str.replace(/^&$/, '');
}

/**
 * Replace kind of broken links
 * @param {String} str link
 * @returns {String}
 */
function fixBrokenLinkWithBracket(str) {
    return str.replace(/^\(/, '');
}

/**
 * Fix broken github links
 * @param {String} str link
 * @returns {*}
 */
function fixGithubLinks(str) {
    str = (/^github\.com/.test(str) ? 'https://' : '') + str;
    return str.replace(/^\/\/github/, 'https://github');
}

/**
 * Try to build full github link by relative github link
 * @param {String} str link
 * @param {BaseNode} node
 * @param {String} lang language
 * @param {String} treeOrBlob - 'tree' or 'blob'
 * @returns {*}
 */
function buildFullGithubLinkForDocs(str, node, lang, treeOrBlob) {
    var sourceFoLang = node.source[lang];
    if(sourceFoLang && sourceFoLang.repo) {
        var repo = sourceFoLang.repo;
        return 'https://' + p.join(repo.host, repo.user, repo.repo, treeOrBlob, repo.ref,
            str.indexOf('.') === 0 ? p.dirname(repo.path) : '', str.replace(/^\//, ''));
    }
    return str;
}

/**
 * Try to recognize different relative links for library embedded docs
 * @param {String} str link
 * @param {BaseNode} node
 * @returns {*}
 */
function recognizeRelativeLinkForLibraryDocs(str, node) {
    var conditions, lib, version, match;

    conditions = node.route.conditions;
    if(!conditions) {
        return [str];
    }

    lib = conditions.lib;
    version = conditions.version;

    if(!lib || !version) {
        return [str];
    }

    //common.blocks/button/button.ru.md
    match = str.match(REGEXP.RELATIVE.BLOCKS);
    if(match) {
        return ['desktop', 'touch-pad', 'touch-phone'].reduce(function(prev, item) {
            prev.push(util.format('/libs/%s/%s/%s/%s', lib, version, item, match[2]));
            return prev;
        }, []);
    }

    //./changelog
    match = str.match(REGEXP.RELATIVE.DOC);
    if(match) {
        match[1] = match[1].toLowerCase();
        return match[1] === 'readme' ?
            [u.format('/libs/%s/%s', lib, version)] :
            [u.format('/libs/%s/%s/%s', lib, version, match[1])];
    }

    //3.1.0-changelog.md
    match = str.match(REGEXP.RELATIVE.VERSION_DOC);
    if(match) {
        return [u.format('/libs/%s/v%s/%s', lib, match[1], match[2])];
    }
    return [str];
}

/**
 * Recognize links for blocks that are on the same level with current block
 * @param {String} str link
 * @param {BlockNode} node of library block
 * @returns {*}
 */
function recognizeRelativeBlockLinkOnSameLevel(str, node) {
    var conditions = node.route.conditions,
        lib = conditions.lib,
        version = conditions.version,
        level = conditions.level;

    var match = str.match(REGEXP.RELATIVE.BLOCK);
    if(match) {
        return util.format('/libs/%s/%s/%s/%s', lib, version, level, match[1]);
    }
    return str;
}

/**
 * Recognize links for blocks that are on different level from current block
 * @param {String} str link
 * @param {BlockNode} node of library block
 * @returns {*}
 */
function recognizeRelativeBlockLinkOnDifferentLevels(str, node) {
    var conditions = node.route.conditions,
        lib = conditions.lib,
        version = conditions.version;

    var match = str.match(REGEXP.RELATIVE.LEVEL);
    if(match) {
        return util.format('/libs/%s/%s/%s/%s', lib, version, match[1], match[2]);
    }
    return str;
}

/**
 * Create map where:
 * key - github source url
 * value - node url
 * @param {Object} sitemap tree object
 * @returns {{}}
 */
function collectUrls(sitemap) {
    var urls = {};

    var traverseTreeNodes = function(node) {
        if(node.url && node.source && node.hidden) {
            utility.getLanguages().forEach(function(lang) {
                if(!node.hidden[lang]) {
                    if(node.source && node.source[lang] && node.source[lang].url) {
                        urls[node.source[lang].url] = node.url;
                    }else {
                        urls[node.id] = node.url;
                    }
                }
            });
        }

        node.items && node.items.forEach(function(item) {
            traverseTreeNodes(item);
        });
        return node;
    };

    sitemap.forEach(function(node) {
        traverseTreeNodes(node);
    });
    return  urls;
}

/**
 * Override links for doc sources
 * @param content - {String} content doc node
 * @param repo - {Object} repository object
 * @param urlHash - {Object} hash with existed urls
 */
function overrideLinks(content, node, urlHash, lang) {
        if (!_.isString(content)) {
            return content;
        }

        return content.replace(REGEXP.LINK, function (str, href) {

            //decode html entities
            href = href.replace(/&#(x?)([0-9a-fA-F]+);?/g, function (str, bs, match) {
                return String.fromCharCode(parseInt(match, bs === 'x' ? 16 : 10));
            });

            var nativeHref = href,
                existedLinks = _.values(urlHash);

            if (isMailTo(href) || isAnchor(href)) {
                return buildHref(href);
            }

            href = fixBrokenLinkWithAmpersand(href);
            href = fixBrokenLinkWithBracket(href);
            href = fixGithubLinks(href);

            var hrefArr = href.split('#'), //extrude anchor from link
                href = hrefArr[0],
                anchor = hrefArr[1],
                links = [],
                replaced;

            if (isNativeSiteLink(href, existedLinks)) {
                return buildHref(href + (anchor ? '#' + anchor : ''));
            }

            //try to recognize
            if (isAbsolute(href)) {
                links.push(href.replace(/\/tree\//, '/blob/'));
                links.push(href.replace(/\/blob\//, '/tree/'));
            } else {
                links.push(buildFullGithubLinkForDocs(href, node, lang, 'tree'));
                links.push(buildFullGithubLinkForDocs(href, node, lang, 'blob'));
                links = links.concat(recognizeRelativeLinkForLibraryDocs(href, node));
                if (node.source.key) {
                    links.push(recognizeRelativeBlockLinkOnSameLevel(href, node));
                    links.push(recognizeRelativeBlockLinkOnDifferentLevels(href, node));
                }
            }

            //remove links that are the same as original
            links = links.filter(function (item) {
                return item !== href;
            });

            links.some(function(item) {
                if(urlHash[item]) {
                    replaced = urlHash[item];
                    return true;
                }
                if(urlHash[item + '/README.md']) {
                    replaced = urlHash[item + '/README.md'];
                    return true;
                }
                if(existedLinks.indexOf(item) > -1) {
                    replaced = item;
                    return true;
                }
                return false;
            });

            if (replaced) {
                href = replaced;
            }
            href += (anchor ? '#' + anchor : '');
            logger.verbose(util.format('native: %s replaced: %s', nativeHref, href), module);
            return buildHref(href);
        });
}

/**
 * Override links in library blocks
 * @param obj
 * @param node
 * @param lang
 * @param urlHash
 */
function overrideBlockLinks(obj, node, lang, urlHash) {
    var source = node.source,
        blocksHash = obj.blocksHash;

    if(!source.key) {
        return;
    }

    var blockHashItem = blocksHash[source.key];
    if(!blockHashItem) {
        //logger.warn('there no block for key %s', source.key);
        return;
    }

    var blockData = blockHashItem.data;
    if(!blockData) {
        //logger.warn('there no block data for key %s', source.key);
        return;
    }

    var description = blockData[lang] ? blockData[lang].description : blockData.description;
    if(!description) {
        //logger.warn('there no description in block data for key %s', source.key);
        return;
    }

    if(_.isArray(description)) {
        //old bem-sets format
        description.forEach(function (item, index) {
            if(blockData[lang]) {
                obj.blocksHash[source.key].data[lang].description[index].content =
                    overrideLinks(item.content || '', node, urlHash, lang);
            }else {
                obj.blocksHash[source.key].data.description[index].content =
                    overrideLinks(item.content || '', node, urlHash, lang);
            }
        });
    }else {
        obj.blocksHash[source.key].data[lang].description =
            overrideLinks(description, node, urlHash, lang);
    }
}

module.exports = function(obj) {
    logger.info('Start overriding links', module);

    var languages = utility.getLanguages(),
        sitemap = obj.sitemap,
        urlHash = collectUrls(sitemap);

    var traverseTreeNodes = function(node) {
        var s = node.source;

        if(s) {
            languages.forEach(function (lang) {
                //override docs links
                if(s[lang] && s[lang].content) {
                    node.source[lang].content = overrideLinks(s[lang].content, node, urlHash, lang);
                    return;
                }
                overrideBlockLinks(obj, node, lang, urlHash);
            });
        }

        node.items && node.items.forEach(function (item) {
            traverseTreeNodes(item);
        });
        return node;
    };

    obj.sitemap.forEach(function (node) {
        traverseTreeNodes(node);
    });

    logger.info('links were overrided', module);
    return obj;
};
