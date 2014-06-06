var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    express = require('express'),
    slashes = require('connect-slashes'),

    config = require('./config'),
    logger = require('./logger')(module),
    middleware = require('./middleware'),
    provider = require('./providers'),
    util = require('./util'),
    model = require('./model');


exports.run = function(worker) {
    worker = worker || { wid: 0 };
    return model.init(worker).then(function() {
        return startServer();
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
        .use(enbServer.createMiddleware({ cdir: rootPath, noLog: false }))
        .use(express.static(rootPath))
        .use(express.favicon(path.resolve(rootPath, 'www', 'favicon.ico')));

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
        .use(middleware.locale())
        .use(middleware.logger())
        .use(middleware.monitoring())
        .use(middleware.proxy())
        .use(middleware.search())
        .use(middleware.router())
        .use(slashes())
        .use(middleware.page())
        .use(middleware.error());

    return app;
};

/**
 * Starts application server
 * @returns {*}
 */
var startServer = function() {
    var def = vow.defer(),
        app = express(),
        socket = config.get('app:socket'),
        port = config.get('app:port') || process.env.port || 8080;

    //add dev middlewares for dev environment
    util.isDev() && addDevelopmentMW(app);

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
