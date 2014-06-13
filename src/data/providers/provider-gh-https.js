var https = require('https'),
    u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../lib/logger')(module),
    BaseProvider = require('./provider-base').BaseProvider;

var GITHUB_PATTERN = {
    PRIVATE: 'https://github.yandex-team.ru/%s/%s/raw/%s/%s',
    PUBLIC: 'https://raw.githubusercontent.com/%s/%s/%s/%s'
};

var GhHttpsProvider = function() {};

GhHttpsProvider.prototype = Object.create(BaseProvider.prototype);

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
GhHttpsProvider.prototype.load = function(options) {
    var def = vow.defer(),
        repository = options.repository,
        url = u.format({
            'public': GITHUB_PATTERN.PUBLIC,
            'private': GITHUB_PATTERN.PRIVATE
        }[repository.type], repository.user, repository.repo, repository.ref, repository.path);

    logger.debug('load data by https from: %s', url);

    https.get(url, function(res) {
        var data = '';

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            var res;
            try {
                res = JSON.parse(data);
                def.resolve(res);
                logger.debug('load data successfully finished from url %s', url);
            }catch(err) {
                def.reject(err.message);
                logger.error('parsing error %s from url %s', err.message, url);
            }

        });
    }).on('error', function(e) {
        logger.error('load data failed with error %s from url %s', e.message, url);
        def.reject(e);
    });

    return def.promise();
};


exports.GhHttpsProvider = GhHttpsProvider;
