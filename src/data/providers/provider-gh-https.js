var https = require('https'),
    util = require('util'),

    vow = require('vow'),
    logger = require('../logger');

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

        logger.debug(util.format('start load data from %s', url), module);
        https.get(url, function (res) {
            res.setEncoding('utf8');

            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                var res;
                try {
                    logger.debug(util.format('end load data from %s', url), module);
                    res = JSON.parse(data);
                    def.resolve(res);
                } catch (err) {
                    def.reject(err.message);
                }

            });
        }).on('error', function (err) {
            logger.error(util.format('error load data from %s %s', url, err.message), module);
            def.reject(err);
        });

        return def.promise();
    };
};
