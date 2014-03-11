var util = require('util'),
    path = require('path'),

    request = require('request'),
    sha = require('sha1')

    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,
    data = require('../modules').data,

    libRepo = require('../config').get('github:librariesRepository');

var PATTERN = '/__example',
    URLS = {
        'private': 'https://github.yandex-team.ru/%s/%s/raw/%s/%s',
        'public': 'https://raw.github.com' //TODO create pattern
    };

module.exports = function() {

    return function(req, res, next) {
        if(req._parsedUrl.path.indexOf(PATTERN) === -1) {
            return next();
        }

        var url = (function(_url) {
            return util.format(URLS[libRepo.type],
                libRepo.user, libRepo.repo, libRepo.ref, _url.replace(PATTERN, ''));
        })(req._parsedUrl.path);

        logger.verbose('request block example by url %s', url);

        data.common
            .loadData(data.common.PROVIDER_FILE_COMMON, {
                path: path.resolve('cache', sha(url))
            })
            .then(
                function(content) {
                    logger.verbose('content from url %s has been loaded from file cache', url);
                    res.end(content);
                },
                function() {
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            logger.verbose('content from url %s has been loaded from github', url);
                            data.common.saveData(data.common.PROVIDER_FILE_COMMON, {
                                path: path.resolve('cache', sha(url)),
                                data: body
                            });
                            res.end(body);
                        }else {
                            res.end('Error while loading example')
                        }
                    });
                }
            );
    };
};