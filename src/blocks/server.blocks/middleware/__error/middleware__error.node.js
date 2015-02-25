var path = require('path'),
    url = require('url'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    terror = require('terror');

modules.define('middleware__error', ['config', 'logger', 'util'], function (provide, config, logger, util) {

    logger = logger(module);

    var staticsUrl = url.format(config.get('statics')),
        metrikaId = config.get('metrika');

    /**
     * Loads compiled error pages for testing and production environments
     * @returns {*}
     */
    function loadErrorPages() {
        var langs = util.getLanguages(),
            errorBundlesPath = path.join(process.cwd(), 'src', 'bundles', 'errors.bundles'),
            errorPages = {};

        return vow.all(langs.map(function (lang) {
            return vow.all([
                vowFs.read(path.join(errorBundlesPath, 'error-404', 'error-404.' + lang + '.html'), 'utf-8'),
                vowFs.read(path.join(errorBundlesPath, 'error-500', 'error-500.' + lang + '.html'), 'utf-8')
            ]).spread(function (error404, error500) {
                errorPages[lang] = {
                    error404: replaceTmplShortcut(error404),
                    error500: replaceTmplShortcut(error500)
                };
            });
        }))
            .then(function () {
                return errorPages;
            });
    }

    /**
     * Replace template shortcut in target file
     * for example:
     * {STATICS_HOST\} - /static_host
     * {METRIKA_ID\} - 123456
     * @param target - source file (now bemjson)
     * @returns {*}
     */
    function replaceTmplShortcut(target) {
        return target
            .replace(/\{STATICS_HOST\}/g, staticsUrl)
            .replace(/\{METRIKA_ID\}/g, metrikaId ? metrikaId : null);
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

        // For cases, when terrors module work not correct
        logger.error('native express error', err);

        if (terr) {
            logger.error('%s %s', code, terr.message);
        } else {
            logger.error(err);
        }

        res.statusCode = code;
    }

    provide(function () {
        return function (err, req, res, next) {
            loadErrorPages()
                .then(function (errorPages) {
                    preparation(err, req, res, next);
                    return res.send(errorPages[req.lang]['error' + res.statusCode]);
                }).done();
        };
    });
});
