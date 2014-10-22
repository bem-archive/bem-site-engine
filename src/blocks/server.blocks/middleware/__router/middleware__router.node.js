modules.define('middleware__router', ['config', 'logger', 'constants', 'model', 'appError'], function(provide, config, logger, constants, model, error) {

    logger = logger(module);

    provide({

        run: function() {
            var _this = this;
            return function(req, res, next) {
                req.__data = req.__data || {};
                logger.debug('get node by request %s', req.path);

                var url = _this.beforeFindNode(req, res, decodeURIComponent(req.path));

                if(!url) {
                    throw error.HttpError.createError(404);
                }

                return _this.findNode(req, url)
                    .then(function(node) {
                        return _this.afterFindNode(node, req, res, next);
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
        findNode: function(req, url) {
            return model.getNodeByUrl(url).then(function(node) {
                if (!node || node.hidden[req.lang]) {
                    logger.error('cannot find node by url %s', url);
                    throw error.HttpError.createError(404);
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
            //if(/\/current\/?/.test(url)) {
            //    var libUrl = url.replace(/\/current\/?.*/, '');
            //
            //    url = this.findNode(req, libUrl, function (result) {
            //        if(!result || !result.items || !result.items.length) {
            //            return libUrl;
            //        }
            //
            //        var version = result.items.map(function (item) {
            //            return item.url.substr(item.url.lastIndexOf('/'));
            //        })[0];
            //
            //        url = url.replace(/\/current\/?/, version + '/');
            //        res.redirect(301, url);
            //        return null;
            //    });
            //}

            return url;
        },

        /**
         * Callback function after find node
         * @param result - {BaseNode} node that was found
         * @param res - {Object} response object
         * @returns {boolean}
         */
        afterFindNode: function(node, req, res, next) {
            return model.getNodeItems(node)
                .then(function(items) {
                    if(items.length) {
                        //redirect to newest library version
                        if(node.lib) {
                            return res.redirect(301, items[0].url);
                        }

                        //redirect to first post of child posts
                        if('group' === node.type || 'posts' === node.view) {
                            return res.redirect(301, items.filter(function (item) {
                                    return !item.hidden[req.lang];
                                })[0].url
                            );
                        }
                    }
                    req.__data.node = node;
                    return next();
                });
        }
    });
});
