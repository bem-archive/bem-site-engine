var path = require('path'),
    fs = require('fs');

modules.define('middleware__service', ['config', 'logger'],
    function (provide, config, logger) {
        logger = logger(module);

        provide(function () {
            return function (req, res, next) {
                var url = req.path;
                if (url.indexOf('/__service') === -1) {
                    return next();
                }
                logger.info('Service request has been received');

                var marker;
                try {
                    marker = fs.readFileSync(path.join(process.cwd(), 'db', 'marker'), { encoding: 'utf-8' });
                } catch (err) {
                    logger.error('Marker file can not be read');
                }

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
                    marker: marker
                };

                return res.json(result);
            };
        });
    });
