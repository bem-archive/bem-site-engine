var path = require('path'),
    url = require('url'),
    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs');

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
     * If the error code does not have its own template
     * show 500 page and logging this error in console
     * @param err - {Error} error
     * @param res - {Object} response object
     */
    function preparation(err, res) {
        var supportedCodes = [404, 500],
            code = supportedCodes.indexOf(err.code) !== -1 ? err.code : 500;

        if (!err.stack) {
            // Module intel waiting field stack in error object
            err.stack = '';
        }

        if (err.app) {
            // Support detail error message from inner site app (forum)
            var message = err.message || '{}';

            try {
                message = JSON.parse(err.message);
            } catch (errMessage) {
                logger.error('Could not parse error app: %s message: %s', err.app, errMessage);
            }

            // Makes a complete error message data from the application
            _.extend(message, {
                code: err.code,
                app: err.app,
                apiMethod: err.apiMethod,
                apiOptions: err.apiOptions
            });

            err.message = JSON.stringify(message, null, 4);
        }

        // Set supported status code for choose template
        res.statusCode = code;
    }

    provide(function () {
        return function (err, req, res, next) {
            next;
            loadErrorPages()
                .then(function (errorPages) {
                    preparation(err, res);
                    var statusCode = res.statusCode;

                    if (statusCode === 404) {
                        logger.warn('404: Resource not found, url: %s', req.url);
                    } else {
                        logger.error(err.stack);
                        logger.error(err + 'code: %s', statusCode);
                    }

                    return res.send(errorPages[req.lang]['error' + res.statusCode]);
                }).done();
        };
    });
});
