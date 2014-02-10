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

var BACKUPS = {
    DIRECTORY: 'backups',
        FILE: 'backup.json'
};

module.exports = {

    PROVIDER_FILE: 'file',
    PROVIDER_GITHUB_API: 'github_api',
    PROVIDER_GITHUB_HTTPS: 'github_https',

    /**
     * initialize github API
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

    loadData: function(repository, provider) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return loadDataFromFile();
            case this.PROVIDER_GITHUB_API:
                return getDataByGithubAPI(repository);
            case this.PROVIDER_GITHUB_HTTPS:
                return getDataByHttps(repository);
            default:
                logger.error('load data provider not recognized');
        }
    },

    saveData: function(data, provider) {
        switch (provider) {
            case this.PROVIDER_FILE:
                return saveDataToFile(data);
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
 * Returns content of repository directory
 * @param repository - {Object} with fields:
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * @returns {*}
 */
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

var getDataByHttps = function(repository) {
    var deferred = vow.defer(),
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

var saveDataToFile = function(data) {
    return fs.write(path.join(BACKUPS.DIRECTORY, BACKUPS.FILE), JSON.stringify(data), 'utf8');
};

var loadDataFromFile = function() {
    return fs.read(path.join(BACKUPS.DIRECTORY, BACKUPS.FILE), 'utf-8')
};
