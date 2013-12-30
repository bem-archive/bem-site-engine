var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    config = require('./config'),
    router = require('./router'),
    middleware = require('./middleware'),
    leData = require('./le-data');

exports.run = function(worker) {
    return leData.init().getData()
        .then(function() {
            var portOrSocket = config.get('app:socket') || config.get('app:port'),
                app = express();

            if ('production' !== process.env.NODE_ENV) {
                app.use(express.static(__dirname));
                app.use(require('enb/lib/server/server-middleware').createMiddleware({ cdir: path.join(__dirname, '..') }));
            }

            app.use(express.logger(config.get('app:logger:mode')))
                .use(express.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.router(router))
                .use(middleware.reloadCache(router, worker))
                .use(middleware.page())
                .use(middleware.error())
                .listen(portOrSocket, function() {
                    if(isNaN(+portOrSocket)) {
                        fs.chmod(portOrSocket, '0777');
                    }
                });

            return app;
        });
};
