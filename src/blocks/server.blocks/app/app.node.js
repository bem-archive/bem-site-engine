var path = require('path'),
    fs = require('fs'),

    _ = require('lodash'),
    vow = require('vow'),
    express = require('express');

modules.require(['config', 'logger', 'util', 'model', 'middleware', 'updater'],
    function(config, logger, util, model, middleware, updater) {
        logger = logger(module);

        /**
         * Set correct rights for socket file
         * @param socket - {String} name of socket
         */
        function chmodSocket(socket) {
            if(socket) {
                try {
                    fs.chmod(socket, '0777');
                }catch(e) {
                    logger.error('Can\'t chmod 0777 to socket');
                }
            }
        }

        /**
         * Adds middlewares for development environment
         * @param app - {Object} express application
         * @returns {Object} app
         */
        function addDevelopmentMW(app) {
            var enbServer = require('enb/lib/server/server-middleware'),
                rootPath = process.cwd();

            app
                .use(enbServer.createMiddleware({ cdir: rootPath, noLog: false }))
                .use(express.static(rootPath))
                .use(express.favicon(path.resolve(rootPath, 'www', 'favicon.ico')));

            return app;
        }

        function startServer() {
            var def = vow.defer(),
                app = express(),
                socket = config.get('socket'),
                port = config.get('port') || process.env.port || 8080;

            //add middleware for dev environment
            util.isDev() && addDevelopmentMW(app);

            app.use(express.query());

            middleware().forEach(function(mw) {
                if(_.isFunction(mw)) {
                    app.use(mw());
                }else if(mw.run) {
                    app.use(mw.run());
                }
            });

            app.listen(port || socket, function (err) {
                if (err) {
                    def.reject(err);
                    return;
                }

                chmodSocket(socket);

                logger.info('start application on %s %s', socket && 'socket' || port && 'port', socket || port);
                def.resolve();
            });

            return def.promise();
        }

        model.init()
            .then(function () {
                return startServer();
            }, this)
            .then(function() {
                if(config.get('update:enable')) {
                    updater.init();
                    updater.start();
                }
            });
    });
