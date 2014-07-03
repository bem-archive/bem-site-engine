var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

/**
 * Loads people data from github repo
 * @returns {Object} people hash
 */
module.exports = function(obj) {
    logger.info('Load all people start');

    var err,
        pr = config.get('data:github:people');

    if(!pr) {
        err = 'People repository was not set in configuration'
    }

    if(!pr.type || !_.isString(pr.type) || !pr.type.length) {
        err = 'Type of people repository was not set in configuration';
    }

    if(!pr.user || !_.isString(pr.user) || !pr.user.length) {
        err = 'User field of people repository was not set in configuration';
    }

    if(!pr.repo || !_.isString(pr.repo) || !pr.repo.length) {
        err = 'Name of people repository was not set in configuration';
    }

    if(!pr.ref  || !_.isString(pr.ref)  || !pr.ref.length) {
        err = 'Reference of people repository was not set in configuration';
    }

    if(!pr.path || !_.isString(pr.path) || !pr.path.length) {
        err = 'Path to data file in people repository was not set in configuration';
    }

    if(err) {
        logger.warn(err);
        return vow.resolve({});
    }

    return providers.getProviderGhApi()
        .load({ repository: pr })
        .then(
            function(result) {
                try {
                    logger.info('People successfully loaded');

                    result = JSON.parse((new Buffer(result.res.content, 'base64')).toString());
                    obj.people = Object.keys(result).reduce(function(prev, key) {
                        prev[key] = result[key];
                        return prev;
                    }, {});
                    return obj;
                }catch(err) {
                    logger.error('Error occur while parsing people data');
                    return {};
                }
            }
        )
        .fail(function(err) {
            logger.error('Error while loading people %s', err);
        });
};
