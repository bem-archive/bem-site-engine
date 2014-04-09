var _ = require('lodash'),
    vow = require('vow'),
    api = require('github'),

    config = require('../lib/config'),
    logger = require('../lib/logger')(module),
    BaseProvider = require('./provider-base').BaseProvider;

    var _gitPrivate,
        _gitPublic;

var GhApiProvider = function() {
    this.init();
};

GhApiProvider.prototype = Object.create(BaseProvider.prototype);

/**
 * Initialize github api connections to public and private repositories
 * with configured credentials
 */
GhApiProvider.prototype.init = function() {
    logger.info('Init Github API provider');

    var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
        privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

    _gitPublic = new api(publicConfig);
    _gitPrivate = new api(privateConfig);

    _gitPublic.authenticate(config.get('github:auth'));

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
        git = repository.type === 'private' ? _gitPrivate : _gitPublic;

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