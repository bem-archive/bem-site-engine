var config = require('../config');

/**
 * Middleware for lang detection by subdomain
 * @returns {Function}
 */
module.exports = function() {
    var languages = config.get('app:languages'),
        defaultLanguage = config.get('app:defaultLanguage');

    return function(req, res, next) {
        var host = req.headers.host,
            lang = host ? host.split('.')[0] : defaultLanguage;

        req.lang = languages.indexOf(lang) > -1 ? lang : defaultLanguage;
        return next();
    };
};
