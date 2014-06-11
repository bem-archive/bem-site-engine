modules.define('middleware__page-meta', ['logger'], function(provide, logger) {
    logger = logger(module);

    provide(function() {

        /**
         * Retrieves meta-information for request by request
         * @param req - {Object} http request object
         *
         * Sets meta object with fields
         * description - {String} meta-description attribute
         * ogDescription - {String} og:description attribute
         * keywords - {String} keywords for source
         * ogKeywords - {String} keywords for source, og:keywords attribute
         * image - {String}
         * ogType - {String}
         * ogUrl - {String} url of source
         */
        return function(req, res, next) {
            var node = req.__data.node,
                source,
                meta = {};

            if(!node.source) {
                meta.description = node.title[req.lang];
                meta.ogUrl = req.url;

                req.__data.meta = meta;
                return next();
            }

            source = node.source[req.lang];

            if(source) {
                meta.description = meta.ogDescription = source.summary;
                meta.keywords = meta.ogKeywords = source.tags ? source.tags.join(', ') : '';

                if(source.ogImage && source.ogImage.length > 0) {
                    meta.image = source.ogImage;
                }else if(source.thumbnail && source.thumbnail.length > 0) {
                    meta.image = source.thumbnail;
                }

                meta.ogType = 'article';
                meta.ogUrl = req.url;

                req.__data.meta = meta;
                return next();
            }
        };
    });
});
