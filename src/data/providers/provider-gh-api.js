var _ = require('lodash'),
    vow = require('vow'),
    api = require('github'),

    config = require('../lib/config'),
    logger = require('../lib/logger')(module);

var GhApiProvider = function() {
    this.init();
};

GhApiProvider.prototype = {

    gitPublic: null,
    gitPrivate: null,
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
        logger.info('Init Github API provider');

        if(config.get('data:github:public'))
            this.gitPublic  = new api(_.extend(config.get('data:github:public'), this.common));

        if(config.get('data:github:private'))
            this.gitPrivate = new api(_.extend(config.get('data:github:private'), this.common));

        var auth = config.get('data:github:public:auth');
        if(auth && _.isString(auth.type) && _.isString(auth.token) && auth.type.length && auth.token.length)
            this.gitPublic.authenticate(config.get('data:github:public:auth'));

        return this;
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
            repository = options.repository,
            git = repository.type === 'private' ? this.gitPrivate : this.gitPublic;

        git.repos.getContent(repository, function(err, res) {
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
        var repository = options.repository,
            git = repository.type === 'private' ? this.gitPrivate : this.gitPublic;

        return git.repos.getBranch(repository, function(err, res) {
            return vow.resolve((err || !res) ? false : true);
        });
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
        var repository = options.repository,
            git = repository.type === 'private' ? this.gitPrivate : this.gitPublic;

        return git.repos.getCommits(repository, function(err, res) {
            return vow.resolve((err || !res) ? null : res);
        });
    }
};

exports.GhApiProvider = GhApiProvider;
