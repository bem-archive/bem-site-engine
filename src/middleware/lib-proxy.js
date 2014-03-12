var util = require('util'),
    path = require('path'),

    request = require('request'),
    sha = require('sha1')

    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,
    data = require('../modules').data,

    libRepo = require('../config').get('github:librariesRepository');

var PATTERN = '/__example',
    CACHE_DIR = 'cache',
    VERSION_REGEXP = /\/v?\d+\.\d+\.\d+\//;

module.exports = function() {

    return function(req, res, next) {
        var requestUrl = req._parsedUrl.path;

        //check for example url. if not then call next middleware
        if(requestUrl.indexOf(PATTERN) === -1) {
            return next();
        }

        var ref = VERSION_REGEXP.test(requestUrl) ? 'tag' : 'branch';

        var url = util.format(libRepo.pattern, libRepo.user, libRepo.repo,
            libRepo.ref, requestUrl.replace(PATTERN, ''));

        logger.verbose('request block example by url %s', url);

        data.common
            .loadData(data.common.PROVIDER_FILE_COMMON, {
                path: path.resolve(CACHE_DIR, ref, sha(url))
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
                            data.common.saveData(data.common.PROVIDER_FILE_COMMON, {
                                path: path.resolve(CACHE_DIR, ref, sha(url)),
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