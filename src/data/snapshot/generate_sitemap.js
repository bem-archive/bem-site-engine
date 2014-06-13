var vow = require('vow'),
    js2xml = require('js2xmlparser'),
    config = require('../lib/config'),
    logger = require('../lib/logger')(module);

module.exports = {
    run: function(sitemap) {
        var urls = getAllUrls(sitemap),
            hosts = config.get('data:hosts'),
            jsonUrls = [];

        if(hosts) {
            Object.keys(hosts).forEach(function (lang) {
                urls.forEach(function (url) {
                    if (!url.hidden[lang]) {
                        jsonUrls.push({
                            loc: hosts[lang] + url.url,
                            changefreq: 'weekly'
                        });
                    }
                });
            });
        }

        return js2xml('urlset', {url: jsonUrls});
    }
};

/**
 * Extrude all node ulrs with hidden properties
 * @param sitemap - {Object} sitemap object
 * @returns {Array}
 */
var getAllUrls = function(sitemap) {
    var urls = [];

    var traverseTreeNodes = function(node) {

        if(node.url && node.hidden) {
            urls.push({
                url: node.url,
                hidden: node.hidden
            });
        }

        if(node.items) {
            node.items.forEach(function(item) {
                traverseTreeNodes(item);
            });
        }
        return node;
    };

    sitemap.forEach(function(node) {
        traverseTreeNodes(node);
    });

    return  urls;
};

