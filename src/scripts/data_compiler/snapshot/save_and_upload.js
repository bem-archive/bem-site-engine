var p = require('path'),
    u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

module.exports = {
    run: function(content) {
        var date = new Date(),
            snapshotName = u.format('snapshot_%s:%s:%s-%s:%s:%s', date.getDate(),
                    date.getMonth() + 1, date.getFullYear(), date.getHours(), date.getMinutes(), date.getSeconds()),
            provider = 'development' === config.get('NODE_ENV') ?
                providers.getProviderFile() : providers.getProviderYaDisk();

        return provider
            .makeDir({ path: p.join(config.get('data:dir'), snapshotName) })
            .then(function() {
                return vow.all([
                    provider.save({
                        path: p.join(config.get('data:dir'), snapshotName, config.get('data:data')),
                        data: JSON.stringify(content)
                    }),
                    provider.save({
                        path: p.join(config.get('data:dir'), snapshotName, config.get('data:marker')),
                        data: JSON.stringify({ data: sha(JSON.stringify(content)) })
                    })
                ]);
            });
    }
};
