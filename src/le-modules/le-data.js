'use strict';

var https = require('https'),
    u = require('util'),
    path = require('path'),

    api = require('github'),
    vow = require('vow'),
    q = require('q'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    util = require('../util'),
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

    var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
        privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

    gitPublic = new api(publicConfig);
    gitPrivate = new api(privateConfig);

    gitPublic.authenticate(config.get('github:auth'));

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
        def.reject(err);
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
        }

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

var getDataByGithubAPI = function(repository) {
    var def = vow.defer();
    gitPublic.repos.getContent(repository, function(err, res) {
        if (err || !res) {
            def.reject({res: null, repo: repository});
        }else {
            def.resolve({res: res, repo: repository});
        }
    });
    return def.promise();
};

var loadSources = function() {
    logger.debug('Load resources');

    var def = vow.defer();
    if(!idSourceMap) {
        return def.reject()
    }

    var promises = _.keys(idSourceMap).map(function(id) {
            logger.silly('source map id: %s source: %s', id, idSourceMap[id]);

            var source = idSourceMap[id];
            //return getDataByGithubAPI(getRepoFromSource(source, 'en.meta.json'));
            return vow
                .allResolved({
                    metaEn: getDataByGithubAPI(getRepoFromSource(source, 'en.meta.json')),
                    mdEn: getDataByGithubAPI(getRepoFromSource(source, 'en.md')),
                    metaRu: getDataByGithubAPI(getRepoFromSource(source, 'ru.meta.json')),
                    mdRu: getDataByGithubAPI(getRepoFromSource(source, 'ru.md'))
                })
                .then(function(value) {
                    var _def = vow.defer();
                    idSourceMap[id] = {
                        en: getSourceFromMetaAndMd(value.metaEn._value, value.mdEn._value),
                        ru: getSourceFromMetaAndMd(value.metaRu._value, value.mdRu._value)
                    };
                    _def.resolve(idSourceMap[id]);
                    return _def.promise();
                });
    });

    return vow.allResolved(promises);
};

var getRepoFromSource = function(source, extention) {
    var re = /^https:\/\/github.com\/(.+?)\/(.+?)\/tree\/(.+?)\/(.+?)\/(.+?)$/i,
        parsedSource = source.match(re),
        path = parsedSource.slice(4).join('/'),
        block = parsedSource[parsedSource.length - 1],
        repoData = {
            user: parsedSource[1],
            repo: parsedSource[2],
            ref: parsedSource[3],
            path: u.format('%s/%s.%s', path, block, extention)
        }

    logger.silly('repo meta user: %s repo: %s ref: %s path: %s',
        repoData.user, repoData.repo, repoData.ref, repoData.path);

    return repoData;
};

var getSourceFromMetaAndMd = function(meta, md) {
    try {
        var repo = meta.repo;

        meta = (new Buffer(meta.res.content, 'base64')).toString();
        meta = JSON.parse(meta);

        try {
            md = (new Buffer(md.res.content, 'base64')).toString();
            md = util.mdToHtml(md);
        } catch(err) {
            md = null;
        }

        meta.content = md;

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.createDate) {
            meta.createDate = util.dateToMilliseconds(meta.createDate);
        }

        //parse date from dd-mm-yyyy format into milliseconds
        if(meta.editDate) {
            meta.editDate = util.dateToMilliseconds(meta.editDate);
        }

        //remove empty strings from authors array
        if(meta.authors && _.isArray(meta.authors)) {
            meta.authors = _.compact(meta.authors);
        }

        //remove empty strings from translators array
        if(meta.translators && _.isArray(meta.translators)) {
            meta.translators = _.compact(meta.translators);
        }

        //TODO  remove this type hack later after sources meta refactoring!
        if(_.isArray(meta.type)) {
            if(meta.type.indexOf('authors') !== -1 || meta.type.indexOf('translators') !== -1) {
                meta.type = 'people';
            }else if(meta.type.indexOf('page') !== -1) {
                meta.type = 'page';
            }else {
                meta.type = 'post';
            }
        }else if(_.isString(meta.type)){
            if(meta.type === 'authors' || meta.type === 'translators') {
                meta.type = 'people';
            }else if(meta.type === 'page') {
                meta.type = 'page';
            }else {
                meta.type = 'post';
            }
        }

        //TODO  remove this root hack later after sources meta refactoring!
        //TODO  remove this categories hack later after sources meta refactoring!
        //TODO  remove this order hack later after sources meta refactoring!
        //TODO  remove this url hack later after sources meta refactoring!
        meta.root && delete meta.root;
        meta.categories && delete meta.categories;
        meta.order && delete meta.order;
        meta.url && delete meta.url;


        //set repo information
        //meta.repo = {
            //url: target.source.url,
            //treeish: target.type === 'branches' ? target.ref : 'master'
        //};

    } catch(err) {
        return null;
    }

    return meta;
};

exports.initSiteStructureAndLoadData = function() {
    logger.info('Init site structure and load data');

    init();

    return loadSiteMap()
        .then(parseSiteMap)
        .then(processSiteMap)
        .then(loadSources)
        .then(
            function() {
                logger.debug('All data has been loaded');
            });
};






