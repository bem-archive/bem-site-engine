var _ = require('lodash'),
    Susanin = require('susanin'),

    HttpError = require('../errors').HttpError,
    logger = require('../logger')(module),
    config = require('../config'),
    model = require('../model');


var router = null;

/**
 * Router middleware
 * @param router - {Object} router module
 * @returns {Function}
 */
module.exports = function() {
    router = model.getRoutes().reduce(function(prev, item) {
        prev.addRoute(item);
        return prev
    }, new Susanin());

    return function(req, res, next) {
        var route = router.findFirst(decodeURIComponent(req.path));

        if(!route) {
            return next(new HttpError(HttpError.CODES.NOT_FOUND));
        }

        req.route = route[0].getName();
        req.params = route[1];
        req.__data = req.__data || {};

        logger.debug('get node by request %s', req.path);

        var url = req.path;
        url = decodeURIComponent(url);
        url = removeTabs(url);
        url = replaceCurrentVersion(req, url);
        url = removeTrailingSlash(url);

        return findNode(req, url, function(result) {
            if(result.lib && result.items) {
                res.redirect(301, result.items[0].url);
                return;

                //return findNode(req, result.items[0].url, null);
            }

            if((result.VIEW.POSTS === result.view) && result.items && result.items.length) {
                url = result.items.filter(function(item) {
                    return !item.hidden[req.lang];
                })[0].url;
                res.redirect(301, url);
                return;

                //return findNode(req, url, null);
            }

            req.__data.node = result;
            return next();
        });
    };
};

/**
 * Find node from model by url comparison
 * @param req - {Object} request object
 * @param url - {String} url string
 * @param callback - {Function} function that should be called for result
 * @returns {*}
 */
var findNode = function(req, url, callback) {

    var result = null;

    /**
     * Recursive method for finding node by it url
     * @param node - {Object} model node
     * @param url - {String} url
     * @returns {Object} node
     */
    var traverseTreeNodes = function(node, url) {
        if(node.url === url) {
            if(node.hidden[req.lang]) {
                throw HttpError.createError(404);
            }
            result = node;
            return result;
        }

        //deep into node items
        if(!result && node.items) {
            node.items.some(function(item) {
                return traverseTreeNodes(item, url);
            });
        }
    };

    model.getSitemap().some(function(item) {
        return traverseTreeNodes(item, url);
    });

    if(result) {
        logger.debug('find node %s %s', result.id, result.source);
        return callback ? callback.call(null, result) : result;
    }else {
        logger.error('cannot find node by url %s', req.path);
        throw HttpError.createError(404);
    }
};

/**
 * Detect /current/ part in url and replace it by actual library version
 * @param url - {String} old url
 * @returns {String} url with replaced current part
 */
var replaceCurrentVersion = function(req, url) {
    if(/\/current\//.test(url)) {
        var libUrl = url.replace(/\/current\/.*/, '');

        return findNode(req, libUrl, function(result) {
            if(!result || !result.items) return;

            var versions = result.items.map(function(item) {
                return _.isObject(item.title) ? item.title[config.get('app:defaultLanguage')] : item.title;
            });

            if(versions) {
                url = url.replace(/\/current\//, '/' + versions[0] + '/');
            }

            return url;
        });
    }

    return url;
};

/**
 * Remove tab parts of url before processing it
 * @param url - {String} old url
 * @returns {String} url with removed tab parts
 */
var removeTabs = function(url) {
    return url.replace(/(\/docs\/)|(\/jsdoc\/)|(\/examples\/)?/gi, '');
};

/**
 * Remove trailing slash for url
 * @param url - {String} url old url
 * @returns {String} url with removed trailing slash
 */
var removeTrailingSlash = function(url) {
    return url !== '/' ? url.replace(/(\/)+$/, '') : url;
};

