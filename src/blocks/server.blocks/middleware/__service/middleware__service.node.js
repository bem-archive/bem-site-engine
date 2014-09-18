modules.define('middleware__service', ['config', 'logger', 'updater'],
    function(provide, config, logger, updater) {
        logger = logger(module);

        provide(function() {
            return function(req, res, next) {
                var url = req.path;
                if(url.indexOf('/__service') === -1) {
                    return next();
                }
                logger.info('Service request has been received');

                var result = {
                    config: {
                        NODE_ENV: config.get('NODE_ENV'),
                        port: config.get('port'),
                        statics: config.get('statics'),
                        logger: {
                            out: config.get('logger:stdout'),
                            err: config.get('logger:stderr')
                        }
                    },
                    marker: updater.getMarker()
                };

                return res.json(result);
            };
        });
    });
