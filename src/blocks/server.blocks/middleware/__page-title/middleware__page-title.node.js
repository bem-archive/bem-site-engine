modules.define('middleware__page-title', ['config', 'logger'], function(provide, config, logger) {

    logger = logger(module);

    provide({
        run: function() {
            var self = this;

            return function(req, res, next) {
                logger.debug('get title by request %s', req.url);

                var node = req.__data.node,
                    titles = [],
                    traverseTreeNodes = function(node) {
                        node.url && node.title && titles.push(node.title[req.lang]);
                        node.parent && traverseTreeNodes(node.parent);
                    };

                if(self.hasExceptions(req, node)) return next();

                traverseTreeNodes(node);

                //add common suffix from application configuration
                titles.push(config.get('title')[req.lang]);

                req.__data.title = titles.join(' / ');
                return next();
            };
        },

        hasExceptions: function(req, node) {
            if(req.url === '/') {
                req.__data.title = node.title[req.lang];
                return true;
            }
        }
    });
});
