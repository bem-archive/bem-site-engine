modules.define('middleware__logger', ['logger'], function (provide, logger) {
    logger = logger(module);

    provide(function () {
        return function (req, res, next) {
            logger.info('request method: %s url: %s locale: %s', req.method, decodeURIComponent(req.url), req.lang);
            return next();
        };
    });
});
