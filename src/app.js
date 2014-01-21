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
            logger.info('-- app run start --');
            logger.info('app run step 1');

            var portOrSocket = config.get('app:socket') || config.get('app:port'),
                app = express(),
                rootPath = path.resolve(__dirname, '..');

            logger.info('port or socket: %s', portOrSocket);
            logger.info('app run step 2');

            if (process.env.NODE_ENV !== 'production') {
                app.use(require('enb/lib/server/server-middleware').createMiddleware({ cdir: rootPath }));
                app.use(express.static(rootPath));
                app.use(express.favicon(path.resolve(rootPath, 'www/favicon.ico')));
            }
            logger.info('app run step 3');

            app.use(express.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.logger())
                .use(middleware.router(router))
                .use(middleware.reloadCache(router, worker));

            logger.info('app run step 4');

            if (forumConfig) {
                app.use(forum(forumConfig, BEMHTML));
            }

            logger.info('app run step 5');

            app.use(middleware.page())
                .use(middleware.error())
                .listen(portOrSocket, function() {
                    if (isNaN(+portOrSocket)) {
                        fs.chmod(portOrSocket, '0777');
                    }
                });

            logger.info('app run step 6');

            //log application initialization
            if (worker) {
                logger.info('start application for worker with id %s on port or socket %s', worker.wid, portOrSocket);
            } else {
                logger.info('start application on port or socket %s', portOrSocket);
            }

            return app;
        });
};
