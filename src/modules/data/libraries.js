var u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    common = require('./common');

var librariesHash = {};

module.exports = {

    load: function() {
        logger.info('Load libraries start');

        var _load = function() {
            if('production' === process.env.NODE_ENV) {
                return common
                    .loadData(common.PROVIDER_YANDEX_DISK, {
                        path: config.get('data:libraries:disk')
                    })
                    .then(function(content) {
                        return JSON.parse(content);
                    });
            }else {
                return common
                    .loadData(common.PROVIDER_FILE, {
                        path: config.get('data:libraries:file')
                    });
            }
        };

        return _load().then(function(content) {
            librariesHash = content;
            return librariesHash;
        })
    },

    getLibraries: function() {
        return librariesHash;
    }
};