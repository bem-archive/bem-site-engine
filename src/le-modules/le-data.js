'use strict';

var https = require('https'),
    util = require('util'),
    path = require('path'),

    api = require('github'),
    vow = require('vow'),
    fs = require('vow-fs'),
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

    gitPublic = new api(publicConfig);
    gitPrivate = new api(privateConfig);

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
        url = util.format({
            'public': 'https://raw.github.com/%s/%s/%s/%s',
            'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s'
        }[dataRepository.type], dataRepository.user, dataRepository.repo, dataRepository.ref, dataRepository.path);

    if (this.getDataFromCache() !== null) {
        deferred.resolve(this.getDataFromCache());
    } else {
        logger.debug('load data from: %s', url);
        https.get(url, function(res) {
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

//----- new beautiful world ------//

var sitemap;

var loadSiteMap = function() {
    return fs
        .read(path.join('configs', 'common', 'sitemap.json'), 'utf-8')
        .fail(
            function(err) {
                logger.error('Sitemap loading failed with error %s', err.message);
            }
        );
};

var parseSiteMap = function(data) {
    var def = vow.defer();

    try {
        sitemap = JSON.parse(data);
        def.resolve(sitemap);
    } catch(err) {
        logger.error('Sitemap parsed with error %s', err.message);
        def.reject(sitemap);
    }

    return def.promise();
};

var processSiteMap = function(sitemap) {
    var nodeR = function(item) {

    };

    sitemap.forEach(function(item) {
        nodeR(item);
    });
};




