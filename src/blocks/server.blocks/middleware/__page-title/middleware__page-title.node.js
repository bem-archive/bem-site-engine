modules.define('middleware__page-title', ['config', 'logger'], function(provide, config, logger) {

    logger = logger(module);

    provide(function() {
        return function(req, res, next) {
            logger.debug('get title by request %s and node %s', req.url);

            var node = req.__data.node,
                titles = [];

            if(req.url === '/') {
                req.__data.title = node.title[req.lang];
                return next();
            }

            var traverseTreeNodes = function(node) {

                if(node.url && node.title) {
                    titles.push(node.title[req.lang]);
                }

                if(node.parent) {
                    traverseTreeNodes(node.parent);
                }
            };

            traverseTreeNodes(node);

            titles.push(config.get('app:title')[req.lang]);

            req.__data.title = titles.join(' / ');
            return next();
        };
    });
});
