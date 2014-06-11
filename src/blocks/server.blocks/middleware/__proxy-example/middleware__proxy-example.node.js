var u = require('util'),
    fs = require('fs'),
    path = require('path'),

    vowFs = require('vow-fs'),
    request = require('request'),
    sha = require('sha1'),
    mime = require('mime');

modules.define('middleware__proxy-example', ['config', 'constants', 'logger', 'util', 'providerFile'],
    function(provide, config, constants, logger, util, providerFile) {

        logger = logger(module);

        var libRepo = config.get('github:librariesRepository');

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
            url = u.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);

            var returnFromCache = function(content) {
                    res.end(content);
                },
                sendRequest = function() {
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            providerFile.save({
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
            return providerFile
                .load({ path: path.resolve(constants.DIRS.CACHE, ref, sha(url)) })
                .then(returnFromCache)
                .fail(sendRequest);
        };

        var proxyImageFiles = function(url, res) {
            //set the content-types by mime type
            res.type(mime.lookup(url));
            url = util.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);

            var p = path.resolve(constants.DIRS.CACHE, sha(url));

            vowFs.exists(p).then(function(exists) {
                if(exists) {
                    fs.createReadStream(p).pipe(res);
                }else {
                    var x = request.get(url);
                    x.pipe(fs.createWriteStream(p));
                    x.pipe(res);
                }
            });
        };

        provide(function() {
            var PATTERN = {
                    EXAMPLE: '/__example',
                    FREEZE: '/output'
                },
                VERSION_REGEXP = /\/v?\d+\.\d+\.\d+\//;

            return function(req, res, next) {
                var url = req.path;

                if(url.indexOf(PATTERN.EXAMPLE) > -1) {
                    return proxyTextFiles(url.replace(PATTERN.EXAMPLE, ''),
                        VERSION_REGEXP.test(url) ? constants.DIRS.TAG : constants.DIRS.BRANCH, res);
                }

                if(url.indexOf(PATTERN.FREEZE) > -1) {
                    return proxyImageFiles(url.replace(PATTERN.FREEZE, ''), res);
                }

                return next();
            };
        })

    });
