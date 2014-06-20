var path = require('path'),
    url = require('url'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    terror = require('terror');

modules.define('middleware__error', ['config', 'logger', 'util', 'builder'], function(provide, config, logger, util, builder) {

    logger = logger(module);

    var staticsUrl = url.format(config.get('app:statics'));

    /**
     * Rebuilds error-{code} html page for each request for development environment
     * @param code - {Number} error code
     * @param lang - {String} lang
     * @returns {*}
     */
    function buildErrorPage(code, lang) {
        var targetName = (code && code === 404) ? 'error-404' : 'error-500',
            target = path.resolve(process.cwd(), 'src', 'bundles', 'errors.bundles') + '/'
                + targetName + '/' + targetName + '.' + lang + '.html';

        return builder.build([target])
            .then(function() {
                return vfs.read(target, 'utf-8');
            })
            .then(function(page) {
                return page.replace(/\{STATICS_HOST\}/g, staticsUrl);
            });
    }

    /**
     * Loads compiled error pages for testing and production environments
     * @returns {*}
     */
    function loadErrorPages() {
        var langs = config.get('common:languages'),
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

    /**
     * Returns middleware function for testing and production environments
     * @returns {Function}
     */
    var prodMiddleware = function() {
        return function(err, req, res, next) {
            return loadErrorPages()
                .then(function(errorPages) {
                    preparation(err, req, res);
                    res.end(errorPages[req.lang][res.statusCode === 404 ? 'error404' : 'error500']);
                });
        };
    };

    /**
     * Returns middleware function for development environment
     * @returns {Function}
     */
    var devMiddleware = function() {
        return function(err, req, res, next) {
            return buildErrorPage(err.code, req.lang)
                .then(function(errorHtml) {
                    preparation(err, req, res);
                    res.end(errorHtml);
                });
        };
    };

    !util.isDev() ? provide(devMiddleware) : provide(prodMiddleware);
});
