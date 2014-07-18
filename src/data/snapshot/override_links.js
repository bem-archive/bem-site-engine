var u = require('util'),
    p = require('path'),

    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module),
    config = require('../lib/config');

var REGEXP = {
    LINK: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g,
    RELATIVE: {
        BLOCK: /^\.\.?\/([\w|-]+)\/?([\w|-]+)?\.?[html|ru\.md|en\.md]?/,
        LEVEL: /^\.\.?\/\.\.\/([\w|-]+)\.blocks\/([\w|-]+)\/?([\w|-]+)?\.?[html|ru\.md|en\.md]?/
    }
};

function collectUrls(sitemap) {
    var urls = {},
        languages = config.get('common:languages');

    var traverseTreeNodes = function(node) {

        if(node.url && node.source && node.hidden) {
            languages.forEach(function(lang) {
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
    try {
        if(!_.isString(content)) {
            return content;
        }

        return content.replace(REGEXP.LINK, function (str, href) {

            //decode html entities
            href = href.replace(/&#(x?)([0-9a-fA-F]+);?/g, function(str, bs, match) {
                return String.fromCharCode(parseInt(match, bs === 'x' ? 16 : 10));
            });

            var nativeHref = href,
                existedLinks = _.values(urlHash),
                isMailTo = /^mailto:/.test(href), //detect mailto links
                isAnchor = /^#(.+)?/.test(href), //detect simple anchors
                buildHref = function(a) { return u.format('<a href="%s"', a) };

            if (isMailTo || isAnchor) {
                return buildHref(href);
            }

            //fix some broken links as single ampersand
            //or links which begins from symbol (
            href = href.replace(/^&$/, '');
            href = href.replace(/^\(/, '');

            //detect some strange links as github.com
            href = (/^github\.com/.test(href) ? 'https://' : '') + href;
            href = href.replace(/^\/\/github/, 'https://github');

            var hrefArr = href.split('#'), //extrude anchor from link
                href = hrefArr[0],
                anchor = hrefArr[1];

            //detect if link is native site link
            if(existedLinks.indexOf(href.replace(/\/$/, '')) > -1) {
                return  buildHref(href + (anchor ? '#' + anchor : ''));
            }

            var _href, match;
            ['tree', 'blob'].some(function (item) {
                _href = href;

                if (!/^(https?:)?\/\//.test(href)) {
                    if (node.source[lang] && node.source[lang].repo) {
                        var repo = node.source[lang].repo;
                        _href = 'https://' + p.join(repo.host, repo.user, repo.repo, item, repo.ref,
                                href.indexOf('.') == 0 ? p.dirname(repo.path) : '', href.replace(/^\//, ''));
                    }

                    //try to recognize relative links in block documentation
                    if (node.source.data) {
                        var conditions = node.route.conditions,
                            lib = conditions.lib,
                            version = conditions.version,
                            level = conditions.level;

                        //try to recognize relative block link on the same level
                        match = href.match(REGEXP.RELATIVE.BLOCK);
                        if(match) {
                            _href = u.format('/libs/%s/%s/%s/%s', lib, version, level, match[1]);
                        }

                        //try to recognize relative block link on the different level
                        match = href.match(REGEXP.RELATIVE.LEVEL);
                        if(match) {
                            _href = u.format('/libs/%s/%s/%s/%s', lib, version, match[1], match[2]);
                        }

                    }
                }

                //find existed resources source-link hash
                if(urlHash[_href]) {
                    _href = urlHash[_href];
                    return true;
                }

                //add readme.md to path and verify again
                var __href = _href + '/README.md';
                if (urlHash[__href]) {
                    _href = urlHash[__href];
                    return true;
                }

                //try to found built link in array of existed links
                var existed = existedLinks.filter(function(link) {
                    return link === _href;
                });

                if(existed.length) {
                    _href = existed[0];
                    return true;
                }

                return false;
            });

            href = _href;
            href += (anchor ? '#' + anchor : '');

            logger.verbose('native: %s replaced: %s', nativeHref, href);
            return buildHref(href);
        });
    }catch(err) {
        logger.warn('overriding link %s was failed');
    }
}

module.exports = function(obj) {
    logger.info('Start overriding links');

    var languages = config.get('common:languages'),
        sitemap = obj.sitemap,
        urlHash = collectUrls(sitemap);

    var traverseTreeNodes = function(node) {

        if(node.source) {
            var s = node.source;
            languages.forEach(function(lang) {
                if(s[lang] && s[lang].content) {
                    node.source[lang].content = overrideLinks(s[lang].content, node, urlHash, lang);
                }

                if(s.data) {
                    var description = s.data[lang] ?
                        s.data[lang].description : s.data.description;

                    if(_.isArray(description)) {
                        description.forEach(function(item, index) {
                            var content = item.content || '';
                            if(s.data[lang]) {
                                node.source.data[lang].description[index].content =
                                    overrideLinks(content, node, urlHash, lang)
                            }else {
                                node.source.data.description[index].content =
                                    overrideLinks(content, node, urlHash, lang);
                            }
                        })
                    }
                }
            });
        }

        node.items && node.items.forEach(function(item) {
            traverseTreeNodes(item);
        });

        return node;
    };

    obj.sitemap.forEach(function(node) {
        traverseTreeNodes(node);
    });

    logger.info('links were overrided');

    return obj;
};
