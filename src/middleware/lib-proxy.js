var util = require('util'),
    path = require('path'),
    fs = require('fs'),

    request = require('request'),
    sha = require('sha1'),

    logger = require('../logger')(module),
    constants = require('../modules').constants,
    provider = require('../modules/providers'),
    mime = require('mime'),

    libRepo = require('../config').get('github:librariesRepository');

var PATTERN = {
        EXAMPLE: '/__example',
        FREEZE: '/output'
    },
    VERSION_REGEXP = /\/v?\d+\.\d+\.\d+\//;

/**
 * Middleware for handling block examples requests
 * @returns {Function}
 */
module.exports = function() {

    return function(req, res, next) {
        var url = req._parsedUrl.path;

        //check for example or freeze url. if not then call next middleware
        if(url.indexOf(PATTERN.EXAMPLE) === -1 && url.indexOf(PATTERN.FREEZE) === -1) {
            return next();
        }

        if(url.indexOf(PATTERN.EXAMPLE) > -1) {
            return proxyTextFiles(url.replace(PATTERN.EXAMPLE, ''),
                VERSION_REGEXP.test(url) ? constants.DIRS.TAG : constants.DIRS.BRANCH, res);
        }

        if(url.indexOf(PATTERN.FREEZE) > -1) {
            return proxyImageFiles(url.replace(PATTERN.FREEZE, ''), res);
        }
    };
};

/**
 * Loads sources for url and sent them to response
 * @param url - {String} url of request
 * @param ref - {String} value of reference (branch or tag)
 * @param res - {Object} response
 * @returns {*}
 */
var proxyTextFiles = function(url, ref, res) {

    //set the content-types by mime type
    res.type(mime.lookup(url));
    url = util.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);

    var returnFromCache = function(content) {
            logger.verbose('content has been loaded from file cache for url %s', url);
            res.end(content);
        },
        sendRequest = function() {
            request(url, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    logger.verbose('content has been loaded from github for url %s ', url);

                    //cache examples to filesystem
                    provider.save(provider.PROVIDER_FILE, {
                        path: path.resolve(constants.DIRS.CACHE, ref, sha(url)),
                        data: body
                    });
                    res.end(body);
                } else {
                    res.end('Error while loading example');
                }
            });
        };

    /*
    try to load cached source from local filesystem
    try to load source from github repository if no cached file was found
    */
    return provider
        .load(provider.PROVIDER_FILE, { path: path.resolve(constants.DIRS.CACHE, ref, sha(url)) })
        .then(returnFromCache, sendRequest);
};

var proxyImageFiles = function(url, res) {
    //set the content-types by mime type
    res.type(mime.lookup(url));
    url = util.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);

    var p = path.resolve(constants.DIRS.CACHE, sha(url));
    /*
     try to load cached source from local filesystem
     try to load source from github repository if no cached file was found
     */
    return provider
        .load(provider.PROVIDER_FILE, { path: p })
        .then(
            function(content) {
                res.end(content);
            },
            function() {
                var x = request.get(url);
                x.pipe(fs.createWriteStream(p));
                x.pipe(res)
            }
        );
};