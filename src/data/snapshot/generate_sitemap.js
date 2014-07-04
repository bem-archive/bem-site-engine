var _ = require('lodash'),
    vow = require('vow'),
    js2xml = require('js2xmlparser'),

    config = require('../lib/config'),
    logger = require('../lib/logger')(module);

module.exports = function(obj) {
    var nodes = getAllNodesForIndexation(obj.sitemap),
        hosts = config.get('data:hosts'),
        sitemapJson = [];

    if(hosts) {
        Object.keys(hosts).forEach(function (lang) {
            nodes.forEach(function(node) {
                if(!node.hidden[lang]) {
                    sitemapJson.push(_.extend({ loc: hosts[lang] + node.url }, node.search));
                }
            });
        });
    }

    obj.sitemapXml = js2xml('urlset', { url: sitemapJson });
    return obj;
};

/**
 * Extrude all node ulrs with hidden properties
 * @param sitemap - {Object} sitemap object
 * @returns {Array}
 */
var getAllNodesForIndexation = function(sitemap) {
    var urls = [];

    var traverseTreeNodes = function(node) {

        if(node.hidden && _.isString(node.url) && !/^(https?:)?\/\//.test(node.url)) {
            urls.push(_.pick(node, 'url', 'hidden', 'search'));
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

