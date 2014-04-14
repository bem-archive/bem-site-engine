var path = require('path'),
    vow = require('vow'),
    fs = require('fs'),
    express = require('express'),
    config = require('./config'),
    logger = require('./logger')(module),
    router = require('./router'),
    middleware = require('./middleware'),
    app = express(),
    socket = config.get('app:socket'),
    port = config.get('app:port') || process.env.port || 8080;

function run(worker) {
    worker = worker || { wid: 0 };

    var model = require('./modules').model,
        deferred = vow.defer();

    return model.init(worker)
        .then(function() {
            router.init();

            if (config.get('NODE_ENV') === 'development') {
                var enbServer = require('enb/lib/server/server-middleware'),
                    rootPath = process.cwd();

                app.use(enbServer.createMiddleware({ cdir: rootPath }));
                app.use(express.static(rootPath));
                app.use(express.favicon(path.resolve(rootPath, 'www/favicon.ico')));
            }

            app
                .use(require('connect-slashes')())
                .use(express.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.logger())
                .use(middleware.monitoring())
                .use(middleware.libProxy())
                .use(middleware.router(router.router))
                .use(middleware.page());

            /*
            if (config.get('forum')) {
                var forum = require('bem-forum/src/middleware/forum'),
                    forumConfig = {
                        github: {
                            api: config.get('github:common'),
                            auth: config.get('github:auth')
                        },
                        repo: config.get('forum:repo'),
                        route: config.get('forum:route')
                    },
                    BEMHTML = require(path.join(process.cwd(), 'src', 'bundles', 'desktop.bundles',
                        'common', 'common.min.template.i18n')).BEMHTML;

                app.use(forum(forumConfig, BEMHTML));
            }
            */

            app.use(middleware.error());

            app.listen(port || socket, function(err) {
                if (err) {
                    deferred.reject(err);
                    return;
                }

                if (socket) {
                    try {
                        fs.chmod(socket, '0777');
                    } catch(e) {
                        logger.error('Can\'t chmod 0777 to socket');
                    }
                }

                logger.info('start application on %s %s', socket && 'socket' || port && 'port', socket || port);
                deferred.resolve();
            });

            return deferred.promise();
        });
}

exports.run = run;
