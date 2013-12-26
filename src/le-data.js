/* global toString: false */
'use strict';

var API = require('github'),
    Vow = require('vow'),
    HTTPS = require('https'),
    UTIL = require('util'),
    _ = require('lodash'),
    config = require('./config');

var _cachedData = null,
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
    console.log('drop cache');
    _cachedData = null;
    return this.getData();
};

/**
 * Retrieve data from data file
 * @returns {Vow.promise}
 */
exports.getData = function() {
    var self = this,
        promise = Vow.promise(),
        url = UTIL.format({
            'public': 'https://raw.github.com/%s/%s/%s/%s',
            'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s'
        }[dataRepository.type], dataRepository.user, dataRepository.repo, dataRepository.ref, dataRepository.path);

    if(this.getDataFromCache() !== null) {
        return promise.fulfill(this.getDataFromCache());
    }

    HTTPS.get(url, function(res) {
        var data = '';

        res.on('data', function(chunk) {
            data += chunk;
        });

        res.on('end', function() {
            _cachedData = JSON.parse(data);
            promise.fulfill(self.getDataFromCache());
        });
    }).on('error', function(e) {
        promise.reject(e);
    });

    return promise;
};