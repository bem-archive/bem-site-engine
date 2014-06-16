var _ = require('lodash'),
    vow = require('vow'),
    api = require('github'),

    config = require('../lib/config'),
    logger = require('../lib/logger')(module),
    BaseProvider = require('./provider-base').BaseProvider;

var GhApiProvider = function() {
    this.init();
};

GhApiProvider.prototype = Object.create(BaseProvider.prototype);

GhApiProvider.prototype.gitPublic = null;
GhApiProvider.prototype.gitPrivate = null;

GhApiProvider.prototype.common = {
    version: "3.0.0",
    protocol: "https",
    timeout: 5000,
    debug: false
};

/**
 * Initialize github api connections to public and private repositories
 * with configured credentials
 */
GhApiProvider.prototype.init = function() {
    logger.info('Init Github API provider');

    if(config.get('data:github:public'))
        this.gitPublic  = new api(_.extend(config.get('data:github:public'), this.common));

    if(config.get('data:github:private'))
        this.gitPrivate = new api(_.extend(config.get('data:github:private'), this.common));

    var auth = config.get('data:github:public:auth');
    if(auth && _.isString(auth.type) && _.isString(auth.token) && auth.type.length && auth.token.length)
        this.gitPublic.authenticate(config.get('data:github:public:auth'));

    return this;
};

/**
 * Returns content of repository directory or file loaded by github api
 * @param repository - {Object} with fields:
 * - type {String} type of repository privacy ('public' or 'private')
 * - user {String} name of user or organization which this repository is belong to
 * - repo {String} name of repository
 * - ref {String} name of branch
 * - path {String} relative path from the root of repository
 * @returns {*}
 */
GhApiProvider.prototype.load = function(options) {
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
};

exports.GhApiProvider = GhApiProvider;
