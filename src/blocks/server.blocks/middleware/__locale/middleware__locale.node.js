modules.define('middleware__locale', ['config'], function(provide, config) {

    /**
     * Middleware for lang detection by subdomain
     * @returns {Function}
     */
    provide(function() {
        var languages = config.get('languages'),
            defaultLanguage = config.get('defaultLanguage');

        return function(req, res, next) {
            var host = req.headers.host,
                lang = host ? host.split('.')[0] : defaultLanguage;

            req.lang = languages.indexOf(lang) > -1 ? lang : defaultLanguage;
            return next();
        };
    });
});

