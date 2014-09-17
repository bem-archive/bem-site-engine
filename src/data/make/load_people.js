var util = require('util'),
    vow = require('vow'),

    logger = require('../logger'),
    config = require('../config'),
    providers = require('../providers');

/**
 * Loads people data from github repo
 * @returns {Object} people hash
 */
module.exports = function(obj) {
    logger.info('Load all people start', module);

    var err,
        pr = config.get('github:people');

    if(!pr) {
        err = 'Path to people data file has not been set in application configuration';
    }

    if(!err) {
        pr = pr.match(/^https?:\/\/(.+?)\/(.+?)\/(.+?)\/(tree|blob)\/(.+?)\/(.+)/);

        if (!pr) {
            err = 'Path to repository has invalid format';
        }else {
            pr = {
                host: pr[1],
                user: pr[2],
                repo: pr[3],
                ref:  pr[5],
                path: pr[6]
            };

            pr.type = pr.host.indexOf('github.com') > -1 ? 'public' : 'private';
        }
    }

    if(err) {
        logger.warn(err);
        return vow.resolve(obj);
    }

    return providers.getProviderGhApi()
        .load({ repository: pr })
        .then(
            function(result) {
                try {
                    logger.info('People successfully loaded', module);

                    result = JSON.parse((new Buffer(result.res.content, 'base64')).toString());
                    obj.people = Object.keys(result).reduce(function(prev, key) {
                        prev[key] = result[key];
                        return prev;
                    }, {});
                    return obj;
                }catch(err) {
                    logger.error('Error occur while parsing people data', module);
                    return {};
                }
            }
        )
        .fail(function(err) {
            logger.error(util.format('Error while loading people %s', err), module);
        });
};
