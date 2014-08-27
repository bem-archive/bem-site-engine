modules.define('middleware__locale', ['logger', 'util'], function(provide, logger, util) {

    logger = logger(module);

    /**
     * Middleware for lang detection by subdomain
     * @returns {Function}
     */
    provide(function() {
        var languages = util.getLanguages(),
            defaultLanguage = util.getDefaultLanguage();

        return function(req, res, next) {
            //TODO Here you can implement your own lang detection mechanism

            req.lang = defaultLanguage;
            logger.debug('request locale was set to %s', req.lang);
            return next();
        };
    });
});

