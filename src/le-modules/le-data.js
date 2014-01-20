'use strict';

var https = require('https'),
    util = require('util'),
    path = require('path'),

    api = require('github'),
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../logger')(module),
    config = require('../config'),

    _cachedData = null,
    gitPrivate = null,
    gitPublic = null,
    dataRepository = config.get('github:dataRepository');

/**
 * Returns cached data from memory
 * @returns {*}
 */
//exports.getDataFromCache = function() {
//    return _cachedData;
//};

/**
 * Returns cached data from memory
 * @returns {*}
 */
//exports.dropCache = function() {
//    logger.info('drop cached data');
//    _cachedData = null;
//    return this.getData();
//};

/**
 * Retrieve data from data file
 * @returns {Vow.promise}
 */
//exports.getData = function() {
//    var _this = this,
//        deferred = vow.defer(),
//        url = util.format({
//            'public': 'https://raw.github.com/%s/%s/%s/%s',
//            'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s'
//        }[dataRepository.type], dataRepository.user, dataRepository.repo, dataRepository.ref, dataRepository.path);
//
//    if (this.getDataFromCache() !== null) {
//        deferred.resolve(this.getDataFromCache());
//    } else {
//        logger.debug('load data from: %s', url);
//        https.get(url, function(res) {
//            var data = '';
//
//            res.on('data', function(chunk) {
//                data += chunk;
//            });
//
//            res.on('end', function() {
//                _cachedData = JSON.parse(data);
//                deferred.resolve(_this.getDataFromCache());
//            });
//        }).on('error', function(e) {
//            deferred.reject(e);
//        });
//    }
//
//    return deferred.promise();
//};

//----- new beautiful world ------//

var sitemap,
    routes,
    idSourceMap = {},
    urlIdMap = {};

/**
 * initialize github API
 */
var init = function() {
    logger.debug('Init');

    //var def = vow.defer();

    var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
        privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

    gitPublic = new api(publicConfig);
    gitPrivate = new api(privateConfig);

    gitPublic.authenticate(config.get('github:auth'));

    //def.resolve();

    //return def.promise;
    return this;
};

var loadSiteMap = function() {
    logger.debug('Load site map');

    return fs
        .read(path.join('configs', 'common', 'sitemap.json'), 'utf-8')
        .fail(
            function(err) {
                logger.error('Site map loading failed with error %s', err.message);
            }
        );
};

var parseSiteMap = function(data) {
    logger.debug('Parse site map');

    var def = vow.defer();

    try {
        sitemap = JSON.parse(data);
        def.resolve(sitemap);
    } catch(err) {
        logger.error('Site map parsed with error %s', err.message);
        def.reject(sitemap);
    }

    return def.promise();
};

var processSiteMap = function(sitemap) {
    logger.debug('Process site map');

    var def = vow.defer(),
        nodeR = function(node, parent) {

        node.id = sha(JSON.stringify(node));
        node.parent = parent;

        if(_.has(node, 'source')) {
            idSourceMap[node.id] = node.source;
        };

        if(_.has(node, 'url')) {
            //TODO implement url building
        }

        if(_.has(node, 'items')) {
            node.items.forEach(function(item) {
               nodeR(item, node);
            });
        }
    };

    sitemap.forEach(function(item) {
        nodeR(item, null);
    });

    return def.resolve(sitemap);
};

var loadSources = function() {
    var def = vow.defer();
    if(!idSourceMap) {
        return def.reject()
    }

    var re = /^https:\/\/github.com\/(.+?)\/(.+?)\/tree\/(.+?)\/(.+?)\/(.+?)$/i,
        promises = _.keys(idSourceMap).map(function(id) {
            logger.silly('source map id: %s source: %s', id, idSourceMap[id]);

            var source = idSourceMap[id],
                parsedSource = source.match(re),
                repoData = {
                    user: parsedSource[1],
                    repo: parsedSource[2],
                    ref: parsedSource[3],
                    path: parsedSource.slice(4).join('/'),
                    block: parsedSource[parsedSource.length - 1]
                };

                logger.silly('repo data user: %s repo: %s ref: %s path: %s block: %s',
                    repoData.user, repoData.repo, repoData.ref, repoData.path, repoData.block);
        });
};

exports.initSiteStructureAndLoadData = function() {
    logger.info('Init site structure and load data');

    init();

    return loadSiteMap()
        //.then(loadSiteMap)
        .then(parseSiteMap)
        .then(processSiteMap)
        .then(loadSources);
};






