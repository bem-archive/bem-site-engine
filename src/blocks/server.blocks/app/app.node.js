var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    express = require('express');

modules.define('app', ['config', 'logger', 'util', 'model', 'middleware'],
    function(provide, config, logger, util, model, middleware) {

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

        provide({
            run: function() {
                return model.init().then(function() {
                    return this.startServer();
                });
            },

            startServer: function() {
                var def = vow.defer(),
                    app = express(),
                    socket = config.get('app:socket'),
                    port = config.get('app:port') || process.env.port || 8080;

                //add middleware for dev environment
                util.isDev() && this.addDevelopmentMW(app);

                app.use(express.query());

                middleware().forEach(function(mw) {
                    app.use(mw());
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
            },

            /**
             * Adds middlewares for development environment
             * @param app - {Object} express application
             * @returns {Object} app
             */
            addDevelopmentMW: function(app) {
                var enbServer = require('enb/lib/server/server-middleware'),
                    rootPath = process.cwd();

                app
                    .use(enbServer.createMiddleware({ cdir: rootPath, noLog: false }))
                    .use(express.static(rootPath))
                    .use(express.favicon(path.resolve(rootPath, 'www', 'favicon.ico')));

                return app;
            }
        })
    });
