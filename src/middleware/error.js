var path = require('path'),
    vow = require('vow'),
    url = require('url'),
    vfs = require('vow-fs'),
    config = require('../config'),
    terror = require('terror'),
    logger = require('../logger')(module),
    staticsUrl = url.format(config.get('statics'));

function buildErrorPage(code, lang) {
    var builder = require('../builder'),
        targetName = (code && code === 404) ? 'error-404' : 'error-500',
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

function loadErrorPages() {
    var langs = config.get('app:languages'),
        errorBundlesPath = path.join(process.cwd(), 'src', 'bundles', 'errors.bundles'),
        errorPages = {};

    return vow.all(langs.map(function(lang) {
        return vow.all([
                vfs.read(path.join(errorBundlesPath, 'error-404', 'error-404.' + lang + '.html'), 'utf-8'),
                vfs.read(path.join(errorBundlesPath, 'error-500', 'error-500.' + lang + '.html'), 'utf-8')
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

function preparation(err, req, res) {
    var code = err.code || 500,
        terr = terror.ensureError(err);

    if (terr) {
        logger.error('%s %s', code, terr.message);
    } else {
        logger.error(err);
    }

    res.statusCode = code;
}

function prodMiddleware() {
    return function(err, req, res, next) {
        /*jshint unused:false */
        loadErrorPages()
            .then(function(errorPages) {
                preparation(err, req, res);
                res.end(errorPages[req.prefLocale][res.statusCode === 404 ? 'error404' : 'error500']);
            });
    };
}

function devMiddleware() {
    return function(err, req, res, next) {
        /*jshint unused:false */
        buildErrorPage(err.code, req.prefLocale)
            .then(function(errorHtml) {
                preparation(err, req, res);
                res.end(errorHtml);
            });
    };
}

module.exports = process.env.NODE_ENV === 'production' ? prodMiddleware : devMiddleware;
