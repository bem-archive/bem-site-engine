/**
 * Middleware for lang detection by subdomain
 * @param langs - {Array} array of configured languages
 * @param def - {String} default language
 * @returns {Function}
 */
module.exports = function(langs, def) {
    return function(req, res, next) {
        var headers = req.headers,
            host = headers.host,
            lang = host ? host.split('.')[0] : def;

        req.prefLocale = langs.indexOf(lang) > -1 ? lang : def;

        next();
    };
};
