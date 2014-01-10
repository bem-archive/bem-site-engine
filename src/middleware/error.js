var PATH = require('path'),
    Url = require('url'),
    vow = require('vow'),
    VowFs = require('vow-fs'),
    config = require('../config'),
    langs = config.get('app:languages'),
    pages = {},
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
    /*jshint unused:false */
    return function(err, req, res, next) {
        promise.then(function() {
            res.statusCode = err.code || 500;

            res.end(pages[req.prefLocale][404 === res.statusCode ? 'error404' : 'error500']);
        });
    };
};