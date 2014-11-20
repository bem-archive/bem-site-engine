var fs = require('fs'),
    zlib = require('zlib'),
    path = require('path');

modules.define('middleware__html-cache', ['logger', 'constants', 'providerFile'],
    function(provide, logger, constants, providerFile) {
    logger = logger(module);

    provide(function() {
        return function(req, res, next) {
            var pagePath = path.join(constants, req.__data.node.url, req.lang + '.html.gzip');

            fs.exists(pagePath, function (exists) {
                if(!exists) {
                    return next();
                }

                logger.debug('load page from cache: %s', pagePath);

                var raw = fs.createReadStream(pagePath);
                var acceptEncoding = req.headers['accept-encoding'];
                if (!acceptEncoding) {
                    acceptEncoding = '';
                }

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

