var vow = require('vow');

modules.define('middleware__router', ['config', 'logger', 'constants', 'model', 'appError'], function(provide, config, logger, constants, model, error) {

    logger = logger(module);

    provide({

        run: function() {
            var _this = this;
            return function(req, res, next) {
                req.__data = req.__data || {};
                logger.debug('get node by request %s', req.path);

                return _this.beforeFindNode(req, res, decodeURIComponent(req.path))
                    .then(function(url) {
                        return _this.findNode(req, url, next);
                    })
                    .then(function(node) {
                        return _this.afterFindNode(node, req, res, next);
                    })
                    .fail(function(err) {
                        return next(err || error.HttpError.createError(500));
                    });
            };
        },

        /**
         * Find node from model by url comparison
         * @param req - {Object} request object
         * @param url - {String} url string
         * @param callback - {Function} function that should be called for result
         * @returns {*}
         */
        findNode: function(req, url, next) {
            return model.getNodeByUrl(url).then(function(node) {
                if (!node || node.hidden[req.lang]) {
                    logger.error('cannot find node by url %s', url);
                    return vow.reject(error.HttpError.createError(404));
                }

                return node;
            });
        },

        /**
         * Callback function before find node
         * @param req - {Object} request object
         * @param url - {String} request url
         * @returns {String} processed url
         */
        beforeFindNode: function(req, res, url) {
            // remove level suffixes
            // Remove tab parts of url before processing it
            // Remove trailing slash for url
            url = url.replace(/\.(sets|docs)/, '');
            url = url.replace(/(\/docs\/)|(\/jsdoc\/)|(\/examples\/)?/gi, '');
            url = url !== '/' ? url.replace(/(\/)+$/, '') : url;


            // TODO implement this case
            //Detect /current/ part in url and replace it by actual library version
            if(!/\/current\/?/.test(url)) {
                return vow.resolve(url);
            }

            var libUrl = url.replace(/\/current\/?.*/, '');
            return this.findNode(req, libUrl).then(function(node) {
                if(!node) {
                    return libUrl;
                }

                return model.getNodeItems(node)
                    .then(function(items) {
                        if(!items || !items.length) {
                            return libUrl;
                        }

                        var version = items
                            .sort(function (a, b) {
                                return a.order - b.order;
                            })
                            .map(function (item) {
                                return item.url.substr(item.url.lastIndexOf('/'));
                            })[0];

                        url = url.replace(/\/current\/?/, version + '/');
                        res.redirect(301, url);
                        return null;
                    });
            });
        },

        /**
         * Callback function after find node
         * @param result - {BaseNode} node that was found
         * @param res - {Object} response object
         * @returns {boolean}
         */
        afterFindNode: function(node, req, res, next) {
            var isLib = !!node.lib,
                isGroupType = node.type === 'group',
                isPostsView =  node.view === 'posts',
                cb = function () {
                    req.__data.node = node;
                    return next();
                };

            if (isLib || isGroupType || isPostsView) {
                return model.getNodeItems(node)
                    .then(function(items) {
                        if(!items.length) {
                            return cb();
                        }

                        //redirect to newest library version
                        if(isLib) {
                            return res.redirect(301, items[0].url);
                        }

                        //redirect to first post of child posts
                        if(isGroupType || isPostsView) {
                            return res.redirect(301, items.filter(function (item) {
                                    return !item.hidden[req.lang];
                                })[0].url
                            );
                        }
                    });
            } else {
                return cb();
            }
        }
    });
});
