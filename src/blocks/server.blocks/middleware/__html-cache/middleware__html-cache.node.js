var fs = require('fs'),
    zlib = require('zlib'),
    path = require('path');

modules.define('middleware__html-cache', ['logger', 'providerFile'], function(provide, logger, providerFile) {
    logger = logger(module);

    provide(function() {
        return function(req, res, next) {
            var pagePath = path.join(process.cwd(), 'cache', 'page', req.__data.node.url, 'page.html');

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

