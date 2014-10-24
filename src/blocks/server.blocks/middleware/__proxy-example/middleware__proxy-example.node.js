var u = require('util'),
    // fs = require('fs'),
    vm = require('vm'),
    // path = require('path'),

    vow = require('vow'),
    // vowFs = require('vow-fs'),
    request = require('request'),
    sha = require('sha1'),
    html = require('js-beautify').html,
    mime = require('mime');

modules.define('middleware__proxy-example', ['config', 'constants', 'logger', 'util', 'model'],
    function (provide, config, constants, logger, util, model) {
        logger = logger(module);

        var libRepo = config.get('github:libraries');

        function loadHtmlCodeOfBlock(req, url, template) {
            var urlRegExp = /^\/(.+)\/(.+)\/(.+)\/(.+)\/(.+)\/(.+)\.bemhtml\.js$/,
                match = url.match(urlRegExp);

            if (!match) {
                return null;
            }

            return model
                .getNodesByCriteria(function (record) {
                    var k = record.key,
                        v = record.value,
                        r = v.route;
                    return k.indexOf(':nodes') > -1 && v.class === 'block' && r && r.conditions &&
                        match[1] === r.conditions.lib &&
                        match[2] === r.conditions.version &&
                        match[3].replace(/\.examples$/, '') === r.conditions.level &&
                        match[4] === r.conditions.block;
                }, true)
                .then(function (node) {
                    if (!node) {
                        return vow.resolve(null);
                    }
                    return model.getBlocks()[node.source.key];
                })
                .then(function (blockData) {
                    var example,
                        htmlStr;

                    if (!blockData) {
                        return vow.resolve(null);
                    }

                    example = blockData.data[req.lang].examples.filter(function (item) {
                        return item.name && match[5] === item.name;
                    })[0];

                    if (!example) {
                        return null;
                    }

                    var bemhtml = {},
                        bemjson = vm.runInNewContext('(' + example.source + ')', {});

                    vm.runInNewContext(template, bemhtml);
                    htmlStr = bemhtml.BEMHTML.apply(bemjson);

                    // return html.prettyPrint(htmlStr);
                    return html(htmlStr, { indent_size: 4 });
                });
        }

        /**
         * Loads sources for url and sent them to response
         * @param {String} url of request
         * @param {String} ref - value of reference (branch or tag)
         * @param  {Object} req - response
         * @param  {Object} res - response
         * @returns {*}
         */
        var proxyTextFiles = function (url, ref, req, res) {
            var originUrl = url;

            // set the content-types by mime type
            res.type(mime.lookup(url));
            url = u.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);

            var sendRequest = function () {
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            if (/\.bemhtml\.js$/.test(url)) {
                                body = loadHtmlCodeOfBlock(req, originUrl, body);
                            }
                            model.putToCache(sha(url), body);
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
            return model.getFromCache(sha(url))
                .then(function (value) {
                    if (value) {
                        return res.end(value);
                    }
                    return sendRequest();
                });
        };

    function proxyImageFiles(url, res) {
        // set the content-types by mime type
        res.type(mime.lookup(url));
        url = u.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, url);
        request.get(url).pipe(res);

        // var p = path.resolve(constants.DIRS.CACHE, sha(url));
        // vowFs.exists(p).then(function (exists) {
        //    if (exists) {
        //        fs.createReadStream(p).pipe(res);
        //    }else {
        //        var x = request.get(url);
        //        x.pipe(fs.createWriteStream(p));
        //        x.pipe(res);
        //    }
        // });
    }

    provide(function () {
        var PATTERN = {
                EXAMPLE: '/__example',
                FREEZE: '/output'
            },
            VERSION_REGEXP = /\/v?\d+\.\d+\.\d+\//;

        return function (req, res, next) {
            var url = req.path;

            if (url.indexOf(PATTERN.EXAMPLE) > -1) {
                return proxyTextFiles(url.replace(PATTERN.EXAMPLE, ''),
                    VERSION_REGEXP.test(url) ? constants.DIRS.TAG : constants.DIRS.BRANCH, req, res);
            }
            if (url.indexOf(PATTERN.FREEZE) > -1) {
                return proxyImageFiles(url.replace(PATTERN.FREEZE, ''), res);
            }
            return next();
        };
    });
});
