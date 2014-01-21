'use strict';

var API = require('github'),
    vow = require('vow'),
    HTTPS = require('https'),
    UTIL = require('util'),
    _ = require('lodash'),
    logger = require('../logger')(module),
    config = require('../config'),

    _cachedData = null,
    gitPrivate = null,
    gitPublic = null,
    dataRepository = config.get('github:dataRepository');

/**
 * initialize github API
 */
exports.init = function() {
    var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
        privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

    gitPublic = new API(publicConfig);
    gitPrivate = new API(privateConfig);

    gitPublic.authenticate(config.get('github:auth'));

    return this;
};

/**
 * Returns cached data from memory
 * @returns {*}
 */
exports.getDataFromCache = function() {
    return _cachedData;
};

/**
 * Returns cached data from memory
 * @returns {*}
 */
exports.dropCache = function() {
    logger.info('drop cached data');
    _cachedData = null;
    return this.getData();
};

/**
 * Retrieve data from data file
 * @returns {Vow.promise}
 */
exports.getData = function() {
    var _this = this,
        deferred = vow.defer(),
        url = UTIL.format({
            'public': 'https://raw.github.com/%s/%s/%s/%s',
            'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s'
        }[dataRepository.type], dataRepository.user, dataRepository.repo, dataRepository.ref, dataRepository.path);

    if (this.getDataFromCache() !== null) {
        deferred.resolve(this.getDataFromCache());
    } else {
        logger.debug('load data from: %s', url);
        HTTPS.get(url, function(res) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function() {
                logger.debug('load data successfully finished');
                _cachedData = JSON.parse(data);
                deferred.resolve(_this.getDataFromCache());
            });
        }).on('error', function(e) {
            logger.error('load data failed with error %s', e.message);
            deferred.reject(e);
        });
    }

    return deferred.promise();
};
