'use strict';

var https = require('https'),
    u = require('util'),
    path = require('path'),

    api = require('github'),
    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),

    util = require('../../util'),
    logger = require('../../logger')(module),
    config = require('../../config'),

    gitPrivate = null,
    gitPublic = null;

module.exports = {

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

    /**
     * Returns content of repository directory
     * @param repository - {Object} with fields:
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    getDataByGithubAPI: function(repository) {
        var def = vow.defer();
        gitPublic.repos.getContent(repository, function(err, res) {
            if (err || !res) {
                def.reject({res: null, repo: repository});
            }else {
                def.resolve({res: res, repo: repository});
            }
        });
        return def.promise();
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

        logger.silly('repo meta user: %s repo: %s ref: %s path: %s',
            result.user, result.repo, result.ref, result.path);

        return result;
    }
};
