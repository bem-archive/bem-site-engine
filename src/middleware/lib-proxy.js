var util = require('util'),
    https = require('https'),
    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,

    libRepo = require('../config').get('github:librariesRepository');

var PATTERN = '/__example',
    HOSTS = {
        'private': 'github.yandex-team.ru',
        'public': 'raw.github.com'
    },
    PATHS = {
        'private': '/%s/%s/raw/%s/%s',
        'public': '' //TODO create pattern
    };

module.exports = function() {

    return function(req, res, next) {
        if(req._parsedUrl.path.indexOf(PATTERN) === -1) {
            return next();
        }

        var getUrl = function(url) {
                return util.format(PATHS[libRepo.type],
                    libRepo.user, libRepo.repo, libRepo.ref, url.replace(PATTERN, ''));
            },
            options = {
                host: HOSTS[libRepo.type],
                path: getUrl(req._parsedUrl.path)
            };

        logger.verbose('request host: %s path %s', options.host, options.path);

        var callback = function(response) {
            var str = '';

            response.on('data', function(chunk) {
                str += chunk;
            });

            response.on('error', function() {
                res.end('<h3>Error data loading</h3>');
            });

            response.on('end', function() {
                res.writeHead(200);
                res.end(str);
            });
        };

        https.request(options, callback).end()
    };
};