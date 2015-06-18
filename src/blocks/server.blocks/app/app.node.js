var path = require('path'),

    _ = require('lodash'),
    vow = require('vow'),
    express = require('express');

modules.define('app', ['config', 'logger', 'util', 'model', 'middleware'],
    function (provide, config, logger, util, model, middleware) {
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
                    // use for relative path to blocks files
                    .use(express.static(rootPath))
                    // use for resolve path like in production files from src/www/ moved to /
                    .use(express.static(path.resolve(staticsDir, 'www')))
                    .use(express.favicon(path.resolve(staticsDir, 'www/favicon.ico')))
                    .disable('x-powered-by');

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
                        app.use(mw(app));
                    } else if (mw.run) {
                        app.use(mw.run(app));
                    }
                });

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

                return def.promise();
            },

            /**
             * Execute custom actions after starting the server
             * Used on levels websites like bem-info
             * @returns {*}
             */
            afterStartServer: function () {
                return vow.resolve();
            },

            init: function () {
                model.init()
                    .then(this.startServer.bind(this))
                    .then(this.afterStartServer.bind(this));
            }
        });
});
