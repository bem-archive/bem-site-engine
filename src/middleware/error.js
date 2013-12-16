var PATH = require('path'),
    Vow = require('vow'),
    VowFs = require('vow-fs'),
    config = require('../config'),
    langs = config.get('app:languages'),
    pages = {},
    promise = Vow.all(langs.map(function(lang) {
        return Vow.all([
                VowFs.read(PATH.join(__dirname, '..', 'errors.bundles', 'error-404', 'error-404.' + lang + '.html'), 'utf-8'),
                VowFs.read(PATH.join(__dirname, '..', 'errors.bundles', 'error-500', 'error-500.' + lang + '.html'), 'utf-8')
            ]).spread(function(error404, error500) {
                pages[lang] = {
                    error404: error404,
                    error500: error500
                }
            });
    }));

module.exports = function() {
    return function(err, req, res, next) {
        promise.then(function() {
            res.statusCode = err.code || 500;

            res.end(pages[req.prefLocale][404 === res.statusCode ? 'error404' : 'error500']);
        });
    };
};