var u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),
    api = require('github'),

    logger = require('../../../logger')(module),
    config = require('../../../config');

var gitPrivate = null,
    gitPublic = null;

module.exports = {

    init: function() {
        logger.info('Init');

        var publicConfig = _.extend(config.get('github:public'), config.get('github:common')),
            privateConfig = _.extend(config.get('github:private'), config.get('github:common'));

        gitPublic = new api(publicConfig);
        gitPrivate = new api(privateConfig);

        gitPublic.authenticate(config.get('github:auth'));
    },

    /**
     * Returns content of repository directory or file loaded by github api
     * @param repository - {Object} with fields:
     * - user {String} name of user or organization which this repository is belong to
     * - repo {String} name of repository
     * - ref {String} name of branch
     * - path {String} relative path from the root of repository
     * @returns {*}
     */
    getContent: function(options) {
        var def = vow.defer(),
            repository = options.repository,
            git = repository.type === 'private' ? gitPrivate : gitPublic;

        git.repos.getContent(repository, function(err, res) {
            if (err || !res) {
                def.reject({res: null, repo: repository});
            }else {
                def.resolve({res: res, repo: repository});
            }
        });
        return def.promise();
    }
};
