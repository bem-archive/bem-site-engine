var https = require('https'),
    u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../../logger')(module);

var MSG = {
    DEBUG: {
        START: 'load data by https from: %s',
        SUCCESS: 'load data successfully finished from url %s'
    },
    ERROR: 'load data failed with error %s from url %s'
};

var GITHUB_PATTERN = {
    PRIVATE: 'https://github.yandex-team.ru/%s/%s/raw/%s/%s',
    PUBLIC: 'https://raw.github.com/%s/%s/%s/%s'
};

module.exports = {

    /**
     * Returns raw content of file loaded by github https protocol
     * @param repository - {Object} with fields:
     * - type {String} type of repository privacy ('public'|'private')
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    load: function(options) {
        var def = vow.defer(),
            repository = options.repository,
            url = u.format({
                'public': GITHUB_PATTERN.PUBLIC,
                'private': GITHUB_PATTERN.PRIVATE
            }[repository.type], repository.user, repository.repo, repository.ref, repository.path);

        logger.debug(MSG.DEBUG.START, url);

        https.get(url, function(res) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                logger.debug(MSG.DEBUG.SUCCESS, url);
                var res;
                try {
                    res = JSON.parse(data);
                    def.resolve(res);
                }catch(err) {
                    def.reject(err.message);
                }

            });
        }).on('error', function(e) {
            logger.error(MSG.ERROR, e.message, url);
            def.reject(e);
        });

        return def.promise();
    }
};
