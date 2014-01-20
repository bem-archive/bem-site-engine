var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    config = require('./config'),
    router = require('./router'),
    logger = require('./logger')(module),
    middleware = require('./middleware'),
    forum = require('bem-forum/src/middleware/forum'),
    forumConfig = config.get('forum') && {
        github: {
            api: config.get('github:common'),
            auth: config.get('github:auth')
        },
        repo: config.get('forum:repo'),
        route: config.get('forum:route')
    },
    BEMHTML = require('./bundles/desktop.bundles/common/_common.bemhtml').BEMHTML,
    leData = require('./le-modules').leData;

exports.run = function(worker) {
    return leData.init().getData()
        .then(function() {
            var portOrSocket = config.get('app:socket') || config.get('app:port'),
                app = express(),
                rootPath = path.resolve(__dirname, '..');

            if (process.env.NODE_ENV !== 'production') {
                app.use(require('enb/lib/server/server-middleware').createMiddleware({ cdir: rootPath }));
                app.use(express.static(rootPath));
                app.use(express.favicon(path.resolve(rootPath, 'www/favicon.ico')));
            }

            app.use(express.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.logger())
                .use(middleware.router(router))
                .use(middleware.reloadCache(router, worker));

            if (forumConfig) {
                app.use(forum(forumConfig, BEMHTML));
            }

            app.use(middleware.page())
                .use(middleware.error())
                .listen(portOrSocket, function() {
                    if (isNaN(portOrSocket)) {
                        fs.chmod(portOrSocket, '0777');
                    }
                });

            //log application initialization
            if (worker) {
                logger.info('start application for worker with id %s on port or socket %s', worker.wid, portOrSocket);
            } else {
                logger.info('start application on port or socket %s', portOrSocket);
            }

            return app;
        });
};
