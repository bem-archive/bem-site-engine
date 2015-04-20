modules.define('middleware__page-title', ['config', 'logger', 'model'], function (provide, config, logger, model) {

    logger = logger(module);

    provide({
        run: function () {
            var _this = this;

            return function (req, res, next) {
                logger.debug('get title by request %s', req.url);

                var node = req.__data.node;

                if (_this.hasExceptions(req, node)) {
                    return next();
                }

                return model.getParentNodes(node).then(function (nodes) {
                    var titles = nodes.reduce(function (prev, item) {
                        if (item.url && item.title) {
                            prev.push(item.title[req.lang]);
                        }
                        return prev;
                    }, []);

                    // add common suffix from application configuration
                    titles.push(config.get('title')[req.lang]);
                    req.__data.title = titles.join(' / ');
                    return next();
                });
            }
        },

        hasExceptions: function (req, node) {
            if (req.url === '/') {
                req.__data.title = node.title[req.lang];
                return true;
            }
        }
    });
});
