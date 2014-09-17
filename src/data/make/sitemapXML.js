var _ = require('lodash'),
    js2xml = require('js2xmlparser'),

    logger = require('../logger'),
    config = require('../config'),
    utility = require('../util');

module.exports = function(obj) {
    logger.info('Start to build "sitemap.xml" file', module);

    var hosts = config.get('hosts') || {},
        nodes = utility
            .findNodesByCriteria(obj.sitemap, function() {
                return this.hidden && _.isString(this.url) && !/^(https?:)?\/\//.test(this.url);
            }, false)
            .map(function(item) {
                return _.pick(item, 'url', 'hidden', 'search');
            }),
        map = nodes.reduce(function(prev, item) {
            Object.keys(hosts).forEach(function(lang) {
                if(!item.hidden[lang]) {
                    prev.push(_.extend({ loc: hosts[lang] + item.url }, item.search));
                }
            });
            return prev;
        }, []);

    obj.sitemapXml = js2xml('urlset', { url: map });
    logger.info('File "sitemap.xml" has been constructed successfully', module);
    return obj;
};
