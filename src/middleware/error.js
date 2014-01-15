var PATH = require('path'),
    Url = require('url'),
    vow = require('vow'),
    VowFs = require('vow-fs'),
    config = require('../config'),
    langs = config.get('app:languages'),
    pages = {},
    terror = require('terror'),
    logger = require('../logger')(module),
    errorBundlesPath = PATH.join(__dirname, '..', 'errors.bundles'),
    promise = vow.all(langs.map(function(lang) {
        return vow.all([
                VowFs.read(PATH.join(errorBundlesPath, 'error-404', 'error-404.' + lang + '.html'), 'utf-8'),
                VowFs.read(PATH.join(errorBundlesPath, 'error-500', 'error-500.' + lang + '.html'), 'utf-8')
            ]).spread(function(error404, error500) {
                var staticsUrl = Url.format(config.get('statics'));

                pages[lang] = {
                    error404: error404.replace(/\{STATICS_HOST\}/g, staticsUrl),
                    error500: error500.replace(/\{STATICS_HOST\}/g, staticsUrl)
                };
            });
    }));

module.exports = function() {
    return function(err, req, res, next) {
        /*jshint unused:false */
        promise.then(function() {
            var code = err.code || 500,
                terr = terror.ensureError(err);

            if (terr) {
                logger.error('%s %s', code, terr.message);
            } else {
                logger.error(err);
            }

            res.statusCode = code;
            res.end(pages[req.prefLocale][res.statusCode === 404 ? 'error404' : 'error500']);
        });
    };
};
