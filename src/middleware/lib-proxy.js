var util = require('util'),
    path = require('path'),

    request = require('request'),
    sha = require('sha1')

    logger = require('../logger')(module),
    constants = require('../modules').constants,
    provider = require('..modules/providers'),

    libRepo = require('../config').get('github:librariesRepository');

var PATTERN = '/__example',
    VERSION_REGEXP = /\/v?\d+\.\d+\.\d+\//;

/**
 * Middleware for handling block examples requests
 * @returns {Function}
 */
module.exports = function() {

    return function(req, res, next) {
        var requestUrl = req._parsedUrl.path;

        //check for example url. if not then call next middleware
        if(requestUrl.indexOf(PATTERN) === -1) {
            return next();
        }

        var ref = VERSION_REGEXP.test(requestUrl) ? constants.DIRS.TAG : constants.DIRS.BRANCH;

        var url = util.format(libRepo.pattern, libRepo.user, libRepo.repo,
            libRepo.ref, requestUrl.replace(PATTERN, ''));

        logger.verbose('request block example by url %s', url);

        //try to load cached example from local filesystem
        //try to load example from github if no cached file were found
        provider.load(provider.PROVIDER_FILE, {
                path: path.resolve(constants.DIRS.CACHE, ref, sha(url))
            })
            .then(
                function(content) {
                    logger.verbose('content has been loaded from file cache for url %s', url);
                    res.end(content);
                },
                function() {
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            logger.verbose('content has been loaded from github for url %s ', url);

                            //cache examples to filesystem
                            provider.save(provider.PROVIDER_FILE, {
                                path: path.resolve(constants.DIRS.CACHE, ref, sha(url)),
                                data: body
                            });
                            res.end(body);
                        }else {
                            res.end('Error while loading example');
                        }
                    });
                }
            );
    };
};