var fs = require('fs'),
    zlib = require('zlib'),
    path = require('path');

modules.define('middleware__html-cache', ['logger', 'constants', 'config'],
    function (provide, logger, constants, config) {
    logger = logger(module);

    provide(function () {

        if (config.get('NODE_ENV') === 'development') {
            return function (req, res, next) {
                return next();
            };
        }

        return function (req, res, next) {
            var pagePath = path.join(constants.PAGE_CACHE, req.__data.node.url, req.lang + '.html.gzip');

            if (req.disableCache) {
                return next();
            }

            fs.exists(pagePath, function (exists) {
                if (!exists) {
                    return next();
                }

                logger.debug('load page from cache: %s', pagePath);
                var raw = fs.createReadStream(pagePath),
                    acceptEncoding = req.headers['accept-encoding'] || '';

                res.contentType('text/html; charset=UTF-8');
                res.removeHeader('X-Powered-By');

                if (acceptEncoding.match(/\bgzip\b/)) {
                    res.writeHead(200, { 'content-encoding': 'gzip' });
                    raw.pipe(res);
                } else if (acceptEncoding.match(/\bdeflate\b/)) {
                    res.writeHead(200, { 'content-encoding': 'deflate' });
                    raw.pipe(res);
                } else {
                    res.writeHead(200, {});
                    raw.pipe(zlib.createGunzip()).pipe(res);
                }
            });
        };
    });
});
