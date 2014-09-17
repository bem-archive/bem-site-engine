var util = require('util'),

    _ = require('lodash'),
    vow = require('vow'),
    api = require('github'),

    config = require('../config'),
    logger = require('../logger');

var GhApiProvider = function() {
    this.init();
};

GhApiProvider.prototype = {

    gitPublic: undefined,
    gitPrivate: undefined,
    common: {
        version: "3.0.0",
        protocol: "https",
        timeout: 5000,
        debug: false
    },

    /**
     * Initialize github api connections to public and private repositories
     * with configured credentials
     */
    init: function() {
        logger.info('Initialize github API module', module);

        var ghConfig = config.get('github'),
            ghPublic = ghConfig.public,
            ghPrivate = ghConfig.private;

        if(ghPublic) {
            this.gitPublic = new api(_.extend(ghPublic, this.common));

            var auth = ghPublic.auth;
            if(auth && auth.length) {
                this.gitPublic.authenticate({
                    type: 'oauth',
                    token: auth
                });
            }else {
                logger.warn('Github API was not authentificated', module);
            }
        }

        if(ghPrivate) {
            this.gitPrivate = new api(_.extend(ghPrivate, this.common));
        }

        return this;
    },

    /**
     * Returns gh module configured for public or private github depending on repository type
     * @param r - {Object} repository type
     * @returns {Object}
     */
    getGit: function(r) {
        return r.type === 'private' ? this.gitPrivate : this.gitPublic;
    },

    /**
     * Returns content of repository directory or file loaded by github api
     * @param options - {Object} with fields:
     * - type {String} type of repository privacy ('public' or 'private')
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    load: function(options) {
        var def = vow.defer(),
            repository = options.repository;
        logger.debug(util.format('Load data from %s %s %s %s',
            repository.user, repository.repo, repository.ref, repository.path), module);

        this.getGit(repository).repos.getContent(repository, function(err, res) {
            if (err || !res) {
                def.reject({res: null, repo: repository});
            }else {
                def.resolve({res: res, repo: repository});
            }
        });
        return def.promise();
    },

    /**
     * Returns info for given branch
     * @param options - {Object} with fields:
     * - type {String} type of repository privacy ('public' or 'private')
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - branch {String} name of branch
     * @returns {*}
     */
    isBranchExists: function(options) {
        var def = vow.defer(),
            repository = options.repository;

        this.getGit(repository).repos.getBranch(repository, function(err, res) {
            def.resolve((err || !res) ? false : true);
        });

        return def.promise();
    },

    /**
     * Returns list of commits of given file path
     * @param options - {Object} with fields:
     * - type {String} type of repository privacy ('public' or 'private')
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    getCommits: function(options) {
        var def = vow.defer(),
            repository = options.repository;

        this.getGit(repository).repos.getCommits(repository, function(err, res) {
            def.resolve(res);
        });

        return def.promise();
    },

    /**
     * Returns name of default branch for current repository
     * @param options - {Object} with fields:
     * - type {String} type of repository privacy ('public' or 'private')
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * @returns {*}
     */
    getDefaultBranch: function(options) {
        var def = vow.defer(),
            repository = options.repository;

        this.getGit(repository).repos.get(repository, function(err, res) {
            def.resolve((err || !res) ? null : res.default_branch);
        });
        return def.promise();
    }
};

exports.GhApiProvider = GhApiProvider;
