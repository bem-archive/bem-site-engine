var u = require('util'),
    p = require('path'),

    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module),
    config = require('../lib/config');

var LINK_REGEXP = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/;

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
        return content.replace(LINK_REGEXP, function (str, href) {
            //if('https://github.com/bem/bem-core/issues/540' === href) {
            //    console.log('!');
            //}

            var nativeHref = href,
                existedLinks = _.values(urlHash),
                isMailTo = /^mailto:/.test(href), //detect mailto links
                isAnchor = /^#(.+)?/.test(href); //detect simple anchors

            if (isMailTo || isAnchor) {
                return href;
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
            if (existedLinks.indexOf(href.replace(/\/$/, '')) > -1) {
                return  href + (anchor ? '#' + anchor : '');
            }

            var _href;
            ['tree', 'blob'].some(function (item) {
                _href = href;

                if (!/^(https?:)?\/\//.test(href)) {
                    if (node.source[lang] && node.source[lang].repo) {
                        var repo = node.source[lang].repo;
                        _href = 'https://' + p.join(repo.host, repo.user, repo.repo, item, repo.ref,
                                href.indexOf('.') == 0 ? p.dirname(repo.path) : '', href.replace(/^\//, ''));
                    }

                    if (node.source.data) {
                        console.log('!');
                    }
                }

                //find existed resources source-link hash
                if (urlHash[_href]) {
                    _href = urlHash[_href];
                    return true;
                }

                //add readme.md to path and verify again
                var __href = _href + '/README.md';
                if (urlHash[__href]) {
                    _href = urlHash[__href];
                    return true;
                }

                return false;
            });

            href = _href;

            console.log('native: %s replaced: %s', nativeHref, href);
            return  href + (anchor ? '#' + anchor : '');
        });
    }catch(err) {
        console.error('error occur %s', node.url);
    }
}

module.exports = function(obj) {
    logger.info('Start overriding links');

    var languages = config.get('common:languages'),
        sitemap = obj.sitemap,
        urlHash = collectUrls(sitemap);

    //console.log('-- url links --');
    //console.log(JSON.stringify(urlHash, null, 4));

    var traverseTreeNodes = function(node) {

        if(node.source) {
            var s = node.source;
            languages.forEach(function(lang) {
                if(s[lang] && s[lang].content) {
                    node.source[lang].content = overrideLinks(s[lang].content, node, urlHash, lang);
                }

                if(s.data && s.data[lang] && s.data[lang].description) {
                    if(_.isArray(s.data[lang].description)) {
                        s.data[lang].description.forEach(function(item, index) {
                            var content = item.content || '';
                            node.source.data[lang].description[index].content =
                                overrideLinks(content, node, urlHash, lang)
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

    sitemap.forEach(function(node) {
        traverseTreeNodes(node);
    });

    return obj;
};
