var path = require('path'),
    url = require('url'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    terror = require('terror');

modules.define('middleware__error', ['config', 'logger', 'util'], function(provide, config, logger, util) {

    logger = logger(module);

    var staticsUrl = url.format(config.get('statics'));

    /**
     * Loads compiled error pages for testing and production environments
     * @returns {*}
     */
    function loadErrorPages() {
        var langs = util.getLanguages(),
            errorBundlesPath = path.join(process.cwd(), 'src', 'bundles', 'errors.bundles'),
            errorPages = {};

        return vow.all(langs.map(function(lang) {
            return vow.all([
                vowFs.read(path.join(errorBundlesPath, 'error-404', 'error-404.' + lang + '.html'), 'utf-8'),
                vowFs.read(path.join(errorBundlesPath, 'error-500', 'error-500.' + lang + '.html'), 'utf-8')
            ]).spread(function(error404, error500) {
                errorPages[lang] = {
                    error404: error404.replace(/\{STATICS_HOST\}/g, staticsUrl),
                    error500: error500.replace(/\{STATICS_HOST\}/g, staticsUrl)
                };
            });
        }))
        .then(function() {
            return errorPages;
        });
    }

    /**
     * Log error message and set statusCode to response
     * @param err - {Error} error
     * @param req - {Object} request object
     * @param res - {Object} response object
     */
    function preparation(err, req, res) {
        var code = err.code || 500,
            terr = terror.ensureError(err);

        if(terr) {
            logger.error('%s %s', code, terr.message);
        }else {
            logger.error(err);
        }

        res.statusCode = code;
    }

    provide(function() {
        return function (err, req, res, next) {
            return loadErrorPages()
                .then(function (errorPages) {
                    preparation(err, req, res, next);
                    res.end(errorPages[req.lang][res.statusCode === 404 ? 'error404' : 'error500']);
                });
        };
    });
});
