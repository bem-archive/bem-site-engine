var path = require('path'),
    util = require('util'),
    vow = require('vow'),

    u = require('../util'),
    config = require('../config'),
    logger = require('../logger')(module),
    provider = require('../modules/providers');

var SEARCH = {
    PING: '/__search/ping',
    LOAD: {
        LIBS: '/__search/libs',
        BLOCKS: '/__search/blocks'
    }
};

module.exports = function() {
    return function(req, res, next) {

        /**
         * Loads files from local filesystem
         * or Yandex Disk depending on environment
         * @param key - {String} config key
         * @returns {*}
         */
        var load = function(key) {
                var opts = { path: path.join(config.get('common:model:dir'), u.isDev() ?
                        '' : config.get('NODE_ENV'), config.get(key)) };

                return provider
                    .load(u.isDev() ? provider.PROVIDER_FILE : provider.PROVIDER_DISK, opts)
                    .then(function (content) {
                        return res.end(content);
                    });
            },
            url = req._parsedUrl.path;

        if(url.indexOf(SEARCH.PING) > -1) {
            return load('common:model:marker');
        }else if(url.indexOf(SEARCH.LOAD.LIBS) > -1){
            return load('common:model:search:libraries');
        }else if(url.indexOf(SEARCH.LOAD.BLOCKS) > -1){
            return load('common:model:search:blocks');
        }else {
            return next();
        }
    };
};
