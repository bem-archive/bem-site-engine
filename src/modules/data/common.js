'use strict';

var https = require('https'),
    path = require('path'),
    u = require('util'),

    api = require('github'),
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    gitPrivate = null,
    gitPublic = null;

module.exports = {

    PROVIDER_FILE: 'file',
    PROVIDER_GITHUB_API: 'github_api',
    PROVIDER_GITHUB_HTTPS: 'github_https',

    /**
     * Initialize github API
     */
    init: function() {
        logger.info('Init');

        var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
            privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

        gitPublic = new api(publicConfig);
        gitPrivate = new api(privateConfig);

        gitPublic.authenticate(config.get('github:auth'));

        return this;
    },

    /**
     * Load data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {Object} result
     */
    loadData: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return loadDataFromJSONFile(options);
            case this.PROVIDER_GITHUB_API:
                return getDataByGithubAPI(options);
            case this.PROVIDER_GITHUB_HTTPS:
                return getDataByHttps(options);
            default:
                logger.error('load data provider not recognized');
        }
    },

    /**
     * Save data
     * @param provider - {String} name of data provider
     * @param options - {Object} options
     * @returns {}
     */
    saveData: function(provider, options) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return saveDataToJSONFile(options);
            default:
                logger.error('save data provider not recognized');
        }
    },

    /**
     * Transform https url of source into repo object suitable for github api using
     * @param source - {String} https url of source block on github
     * @param extension - {String} file extension
     * @returns {Object} with fields:
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * - block {String} name of block
     */
    getRepoFromSource: function(source, extention) {

        var repoData = (function(_source) {
            var re = /^https?:\/\/(.+?)\/(.+?)\/(.+?)\/tree\/(.+?)\/(.+\/(.+))/,
                parsedSource = _source.match(re);
            return {
                host: parsedSource[1],
                user: parsedSource[2],
                repo: parsedSource[3],
                ref: parsedSource[4],
                path: parsedSource[5],
                block: parsedSource[6]
            };
        })(source);

        var result = _.extend(repoData, {path: u.format('%s/%s.%s', repoData.path, repoData.block, extention)});

        logger.verbose('get repo from source user: %s repo: %s ref: %s path: %s',
            result.user, result.repo, result.ref, result.path);

        return result;
    }
};

/**
 * Returns loaded and parsed content of json file
 * @param options - {Object} with fields
 * - path {String} path to file
 * @returns {Object}
 */
var loadDataFromJSONFile = function(options) {
    logger.debug('load data from json file %s', JSON.stringify(options));

    return fs.read(options.path, 'utf-8')
        .then(
            function(content) {
                return JSON.parse(content);
            },
            function() {
                logger.warn('cannot read content of %s file', options.path);
                return {};
            }
        );
};

/**
 * Returns content of repository directory or file loaded by github api
 * @param repository - {Object} with fields:
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * @returns {*}
 */
var getDataByGithubAPI = function(options) {
    var def = vow.defer(),
        repository = options.repository;

    gitPublic.repos.getContent(repository, function(err, res) {
        if (err || !res) {
            def.reject({res: null, repo: repository});
        }else {
            def.resolve({res: res, repo: repository});
        }
    });
    return def.promise();
};

/**
 * Returns raw content of file loaded by github https protocol
 * @param repository - {Object} with fields:
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * @returns {*}
 */
var getDataByHttps = function(options) {
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
};

/**
 * Stringify and save data object into json file
 * @param options - {Object} with fields:
 * - path {String} path to target file
 * - data {Object} content for file
 * @returns {*}
 */
var saveDataToJSONFile = function(options) {
    logger.debug('save data to json file %s', options.path ? JSON.stringify(options.path) : 'unknown file');
    return fs.write(options.path, JSON.stringify(options.data), 'utf8');
};
