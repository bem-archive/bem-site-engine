var util = require('util'),
    request = require('request'),
    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,

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

        logger.verbose('request block example by url', url);

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }else {
                res.end('Error while loading example')
            }
        });
    };
};