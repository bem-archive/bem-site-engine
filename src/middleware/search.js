var path = require('path'),
    util = require('util'),
    vow = require('vow'),

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
                var isDev = 'development' === config.get('NODE_ENV'),
                    opts = { path: path.join(config.get('data:dir'), isDev ?
                        '' : config.get('NODE_ENV'), config.get(key)) };

                return provider
                    .load(isDev ? provider.PROVIDER_FILE : provider.PROVIDER_DISK, opts)
                    .then(function (content) {
                        return res.end(content);
                    });
            },
            url = req._parsedUrl.path;

        if(url.indexOf(SEARCH.PING) > -1) {
            return load('data:marker');
        }else if(url.indexOf(SEARCH.LOAD.LIBS) > -1){
            return load('data:search:libraries');
        }else if(url.indexOf(SEARCH.LOAD.BLOCKS) > -1){
            return load('data:search:blocks');
        }else {
            return next();
        }
    };
};
