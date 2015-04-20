var vm = require('vm'),

    _ = require('lodash'),
    vow = require('vow'),
    sha = require('sha1'),
    html = require('js-beautify').html,
    request = require('request'),
    mime = require('mime');

modules.define('middleware__proxy-example', ['config', 'constants', 'logger', 'util', 'model', 'storage'],
    function (provide, config, constants, logger, util, model, storage) {
        logger = logger(module);

        storage.init();

        /**
         * Loads sources for url and sent them to response
         * @param {String} url of request
         * @param  {Object} req - response object
         * @param  {Object} res - response object
         * @returns {*}
         */
        var proxyTextFiles = function (url, req, res) {
            var originUrl = url;

            // set the content-types by mime type
            // fix firefox charsets for bemjson files
            res.type(mime.lookup(url));
            if (/\.bemjson\.js$/.test(url)) {
                res.header('Content-Type', 'application/json; charset=utf-8');
            }

            model.getFromCache(sha(url))
                .then(function (response) {
                    if (response && _.isString(response)) {
                        return res.end(response);
                    }
                    logger.debug('request to url: %s', url);
                    return storage.read(url, function (error, response) {
                        if (error) {
                            logger.warn('req to %s failed with err %s', url, error);
                            return res.end('Error while loading example');
                        }

                        if (/\.bemhtml\.js$/.test(url)) {
                            return loadCode(req, originUrl, response).then(function (html) {
                                model.putToCache(sha(url), html);
                                res.end(html);
                            });
                        } else {
                            model.putToCache(sha(url), response);
                            return res.end(response);
                        }
                    });
                })
                .done();
        };

        /**
         * Proxy image files from gh
         * @param {String} url
         * @param {Object} res - response object
         */
        function proxyImageFiles(url, res) {
            res.type(mime.lookup(url));

            // special case for svg,
            // because it the same like text
            if (/\.svg$/.test(url)) {
                return storage.read(url, function(error, value) {
                    error ? res.status(404).end('Svg not Found') : res.end(value);
                });
            }

            request.get(storage.getFullUrl(url)).pipe(res);
        }

        provide(function () {
            var PATTERN = {
                    EXAMPLE: '/__example/',
                    FREEZE: '/output/'
                };

            return function (req, res, next) {
                var url = req.path;

                if (url.indexOf(PATTERN.EXAMPLE) > -1) {
                    return proxyTextFiles(url.replace(PATTERN.EXAMPLE, ''), req, res);
                }
                if (url.indexOf(PATTERN.FREEZE) > -1) {
                    return proxyImageFiles(url.replace(PATTERN.FREEZE, ''), res);
                }
                return next();
            };
        });

        function loadCode(req, url, template) {
            var urlRegExp = /^\/?(.+)\/(.+)\/(.+)\/(.+)\/(.+)\/(.+)\.bemhtml\.js$/,
                match = url.match(urlRegExp);

            if (!match) { return null; }

            return model
                .getNodesByCriteria(function (record) {
                    var v = record.value,
                        r = v.route,
                        c;

                    if (!r) {
                        return false;
                    }

                    c = r.conditions;
                    return v.class === 'block' && r && c &&
                        match[1] === c.lib &&
                        match[2] === c.version &&
                        match[3].replace(/\.examples$/, '') === c.level &&
                        match[4] === c.block;
                }, true)
                .then(function (node) {
                    if (!node) { return vow.resolve(null); }
                    return model.getBlock(node.value.source.data);
                })
                .then(function (blockData) {
                    var example, htmlStr;
                    if (!blockData) { return vow.resolve(null); }
                    example = blockData[req.lang].examples.filter(function (item) {
                        return item.name && match[5] === item.name;
                    })[0];

                    if (!example) { return null; }

                    var bemhtml = {},
                        bemjson = vm.runInNewContext('(' + example.source + ')', {});

                    vm.runInNewContext(template, bemhtml);
                    htmlStr = bemhtml.BEMHTML.apply(bemjson);

                    // return html.prettyPrint(htmlStr);
                    return html(htmlStr, { 'indent_size': 4 });
                });
        }
});
