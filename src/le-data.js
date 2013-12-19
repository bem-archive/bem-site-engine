/* global toString: false */
'use strict';

var API = require('github'),
    Vow = require('vow'),
    HTTPS = require('https'),
    UTIL = require('util'),
    _ = require('underscore');

var git = null,
    repoConf = null,
    _cachedData = null;

var getDataFromCache = function() {
    return _cachedData;
};

var setDataToCache = function(data) {
    _cachedData = data;
};

var clearCache = function() {
    _cachedData = null;
};

/**
 * initialize github API
 */
(function() {
    var commonConfig = {
            "version": "3.0.0",
            "debug": "true",
            "protocol": "https",
            "timeout": "5000"
        },
        publicConfig = {
            "host": "api.github.com"
        };

    git = new API(_.extend(publicConfig, commonConfig));

    git.authenticate({
        type: "oauth",
        token: "7a2fb4d7a380f8a20562f5fc910f35d3b1605341"
    });

    repoConf = {
        user: 'tormozz48',
        repo: 'bem-data',
        ref: 'master'
    };
})();

/**
 * Retrieve data from data file
 * @returns {Vow.promise}
 */
exports.getData = function() {
    var promise = Vow.promise(),
        config = _.extend({ path: 'data.json' }, repoConf);

    if(getDataFromCache() !== null) {
        promise.fulfill(getDataFromCache());
    }else {
        var url = UTIL.format('https://raw.github.com/%s/%s/%s/%s',
                    config.user, config.repo, config.ref, config.path);
        HTTPS.get(url, function(res) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });

            res.on('end', function(){
                data = JSON.parse(data);
                setDataToCache(data);
                promise.fulfill(data);
            });
        }).on('error', function(e) {
            promise.reject(e);
        });
    }
    return promise;
};

exports.getLibs = function() {
    //TODO implement later
};

exports.getLibVersions = function(lib) {
    //TODO implement later
};

exports.getLibLevels = function(lib, version) {
    //TODO implement later
};

exports.getLibBlocks = function(lib, version, level) {
    //TODO implement later
};

exports.getBlock = function(lib, version, level, block) {
    //TODO implement later
};
