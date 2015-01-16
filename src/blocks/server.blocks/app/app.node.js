var path = require('path'),

    _ = require('lodash'),
    vow = require('vow'),
    // vowFs = require('vow-fs'),
    express = require('express');

modules.define('app', ['config', 'logger', 'util', 'model', 'middleware', 'updater'],
    function (provide, config, logger, util, model, middleware, updater) {
        logger = logger(module);

        provide({
            /**
             * Adds middlewares for development environment
             * @param {Object} app - express application
             * @returns {Object} app
             */
            addDevelopmentMW: function (app) {
                var enbServer = require('enb/lib/server/server-middleware'),
                    rootPath = process.cwd(),
                    staticsDir = path.join(rootPath, 'src');

                app
                    .use(enbServer.createMiddleware())
                    .use(express.static(rootPath))
                    .use(express.favicon(path.resolve(staticsDir, 'www/favicon.ico')));

                return app;
            },

            startServer: function () {
                var def = vow.defer(),
                    app = express(),
                    port = config.get('port') || process.env.port || 8080;

                // add middleware for dev environment
                util.isDev() && this.addDevelopmentMW(app);

                app.use(express.query());

                middleware().forEach(function (mw) {
                    if (_.isFunction(mw)) {
                        app.use(mw());
                    } else if (mw.run) {
                        app.use(mw.run());
                    }
                });

                // util.unlinkSocket(port).then(function () {
                    app.listen(port, function (err) {
                        if (err) {
                            def.reject(err);
                            return;
                        }

                        util.chmodSocket(port).then(function () {
                            logger.info('start application on port or socket %s', port);
                            def.resolve();
                        });
                    });
                // });

                return def.promise();
            },

            init: function () {
                model.init()
                    .then(function () {
                        return this.startServer();
                    }, this)
                    .then(function () {
                        if (config.get('update:enable')) {
                            updater.init();
                            updater.start();
                        }
                    });
            }
        });
});
