var path = require('path'),
    vow = require('vow'),
    fs = require('fs'),
    express = require('express'),
    config = require('./config'),
    logger = require('./logger')(module),
    router = require('./router'),
    middleware = require('./middleware'),
    provider = require('./modules/providers'),
    model = require('./modules').model;


exports.run = function(worker) {
    worker = worker || { wid: 0 };
    return model.init(worker).then(function() {
        return vow.allResolved([startServer(), loadSitemapXml()]);
    });
};

/**
 * Adds middlewares for development environment
 * @param app - {Object} express application
 * @returns {Object} app
 */
var addDevelopmentMW = function(app) {
    var enbServer = require('enb/lib/server/server-middleware'),
        rootPath = process.cwd();

    app
        .use(enbServer.createMiddleware({ cdir: rootPath }))
        .use(express.static(rootPath))
        .use(express.favicon(path.resolve(rootPath, 'www/favicon.ico')));

    return app;
};

/**
 * Add middlewares which are used for all environments
 * @param app - {Object} express application
 * @returns {Object} app
 */
var addCommonMW = function(app) {
    app
        .use(express.query())
        .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
        .use(middleware.logger())
        .use(middleware.monitoring())
        .use(middleware.libProxy())
        .use(middleware.router(router.router))
        .use(middleware.page())
        .use(middleware.error());

    return app;
};

/**
 * Starts application server
 * @returns {*}
 */
var startServer = function() {
    router.init();

    var def = vow.defer(),
        app = express(),
        socket = config.get('app:socket'),
        port = config.get('app:port') || process.env.port || 8080;

    //add dev middlewares for dev environment
    config.get('NODE_ENV') === 'development' && addDevelopmentMW(app);

    //add common middlewares
    addCommonMW(app);

    app.listen(port || socket, function(err) {
        if(err) {
            def.reject(err);
            return;
        }

        if(socket) {
            try {
                fs.chmod(socket, '0777');
            } catch(e) {
                logger.error('Can\'t chmod 0777 to socket');
            }
        }

        logger.info('start application on %s %s', socket && 'socket' || port && 'port', socket || port);
        def.resolve();
    });

    return def.promise();
};

/**
 * Loads sitemap xml file and saves it to application root directory
 * @returns {*}
 */
var loadSitemapXml = function() {
    var SITEMAP_FILENAME = 'sitemap.xml',
        isDev = 'development' === config.get('NODE_ENV'),
        opts = { path: path.join(config.get('data:dir'), isDev ? '' : config.get('NODE_ENV'), SITEMAP_FILENAME) };

        return provider.load(isDev ? provider.PROVIDER_FILE : provider.PROVIDER_DISK, opts).then(function(content) {
            return provider.save(provider.PROVIDER_FILE, {
                data: content,
                path: path.join(process.cwd(), SITEMAP_FILENAME)
            });
        });
};
