var https = require('https'),
    util = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../lib/logger')(module);

exports.GhHttpsProvider = function() {

    this.GITHUB_PATTERN = {
        PRIVATE: 'https://github.yandex-team.ru/%s/%s/raw/%s/%s',
        PUBLIC: 'https://raw.githubusercontent.com/%s/%s/%s/%s'
    };

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
    this.load = function (options) {
        var def = vow.defer(),
            repository = options.repository,
            url = util.format({
                'public': this.GITHUB_PATTERN.PUBLIC,
                'private': this.GITHUB_PATTERN.PRIVATE
            }[repository.type], repository.user, repository.repo, repository.ref, repository.path);

        logger.debug('load data by https for: %s', repository.path);

        https.get(url, function (res) {
            var data = '';

            res.on('data', function (chunk) {
                data += chunk;
            });

            res.on('end', function () {
                var res;
                try {
                    res = JSON.parse(data);
                    def.resolve(res);
                    logger.debug('load data successfully finished for %s', repository.path);
                } catch (err) {
                    def.reject(err.message);
                    logger.error('parsing error %s from url %s', err.message, url);
                }

            });
        }).on('error', function (e) {
            logger.error('load data failed with error %s from url %s', e.message, url);
            def.reject(e);
        });

        return def.promise();
    };
};
