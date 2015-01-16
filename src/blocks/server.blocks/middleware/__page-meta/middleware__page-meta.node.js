modules.define('middleware__page-meta', ['logger', 'model'], function (provide, logger, model) {
    logger = logger(module);

    provide(function () {

        /**
         * Retrieves meta-information for request by request
         * @param req - {Object} http request object
         * Sets meta object with fields:
         * description - {String} meta-description attribute
         * ogDescription - {String} og:description attribute
         * keywords - {String} keywords for source
         * ogKeywords - {String} keywords for source, og:keywords attribute
         * ogType - {String} type of source
         * ogUrl - {String} url of source
         */
        return function (req, res, next) {
            logger.debug('get meta by request %s', req.url);

            var node = req.__data.node,
                meta = {
                    description: node.title ? node.title[req.lang] : '',
                    ogUrl: req.url
                };

            return model.getSourceOfNode(node, req.lang)
                .then(function (doc) {
                    if (doc) {
                        meta.description = meta.ogDescription = doc.title;
                        meta.keywords = meta.ogKeywords = doc.tags ? doc.tags.join(', ') : '';
                        meta.ogType = 'article';
                    }

                    req.__data.meta = meta;
                    return next();
                });
        };
    });
});
