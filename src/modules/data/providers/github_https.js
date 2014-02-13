var https = require('https'),
    u = require('util'),

    logger = require('../../../logger')(module);


module.exports = {

    /**
     * Returns raw content of file loaded by github https protocol
     * @param repository - {Object} with fields:
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    load: function(options) {
        var deferred = vow.defer(),
            repository = options.repository,
            url = u.format({
                'public': 'https://raw.github.com/%s/%s/%s/%s',
                'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s'
            }[repository.type], repository.user, repository.repo, repository.ref, repository.path);

        logger.debug('load data by https from: %s', url);

        https.get(url, function(res) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                logger.debug('load data successfully finished from url %s', url);
                deferred.resolve(JSON.parse(data));
            });
        }).on('error', function(e) {
            logger.error('load data failed with error %s from url %s', e.message, url);
            deferred.reject(e);
        });

        return deferred.promise();
    }
};
