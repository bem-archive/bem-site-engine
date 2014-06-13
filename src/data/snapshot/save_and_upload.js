var path = require('path'),
    util = require('util'),

    vow = require('vow'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

module.exports = function(content) {
    var date = new Date(),
        snapshotName = util.format('snapshot_%s:%s:%s-%s:%s:%s', date.getDate(),
                date.getMonth() + 1, date.getFullYear(), date.getHours(), date.getMinutes(), date.getSeconds()),
        provider = 'development' === config.get('NODE_ENV') ?
            providers.getProviderFile() : providers.getProviderYaDisk(),

        sitemapXml = content.sitemapXml,
        search = content.search,
        data = _.omit(content, 'sitemapXml', 'search');

    return provider
        .makeDir({ path: path.join(config.get('common:model:dir'), snapshotName) })
        .then(function() {

            var promises = [
                {
                    path: config.get('common:model:data'),
                    data: JSON.stringify(data)
                },
                {
                    path: 'sitemap.xml',
                    data: sitemapXml
                },
                {
                    path: config.get('common:model:search:libraries'),
                    data: JSON.stringify(search.libraries, null, 4)
                },
                {
                    path: config.get('common:model:search:blocks'),
                    data: JSON.stringify(search.blocks, null, 4)
                },
                {
                    path: config.get('common:model:marker'),
                    data: JSON.stringify({
                        data: sha(JSON.stringify(data)),
                        date: snapshotName
                    })
                }
            ].map(function(item) {
                    return provider.save({
                        path: path.join(config.get('common:model:dir'), snapshotName, item.path),
                        data: item.data
                    });
                });

            return vow.all(promises);
        });
};
