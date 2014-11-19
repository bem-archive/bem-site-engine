var path = require('path'),
    url = require('url'),

    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    fsExtra = require('fs-extra'),
    zlib = require('zlib'),
    vow = require('vow');

modules.define('util', ['logger', 'constants', 'config'], function (provide, logger, constants, config) {
    logger = logger(module);

    provide({

        /**
         * Checks if current environment is development
         * @returns {boolean}
         */
        isDev: function () {
            return config.get('NODE_ENV') === 'development';
        },

        /**
         * Set correct rights for socket file
         * @param {String} socket - path to socket file
         */
        chmodSocket: function (socket) {
            return _.isString(socket) ?
                vowFs.exists(socket).then(function (exists) {
                    return exists ? vowFs.chmod(socket, '0777') : vow.resolve();
                }) : vow.resolve();
        },

        /**
         * Unlink socket
         * @param {String} socket - path to socket file
         */
        unlinkSocket: function (socket) {
            return _.isString(socket) ?
                vowFs.exists(socket).then(function (exists) {
                    return exists ? vowFs.remove(socket) : vow.resolve();
                }) : vow.resolve();
        },

        /**
         * Returns array of configured app languages
         * @returns {*|string[]}
         */
        getLanguages: function () {
            return config.get('languages') || ['en'];
        },

        /**
         * Returns default application language
         * @returns {*|string}
         */
        getDefaultLanguage: function () {
            return config.get('defaultLanguage') || 'en';
        },

        zip: function(content) {
            var def = vow.defer();
            zlib.gzip(new Buffer(content, 'utf-8'), function(err, result) {
                def.resolve(err ? content : result);
            });
            return def.promise();
        },

        unzip: function (content) {
            var def = vow.defer();
            zlib.gunzip(new Buffer(content, 'utf-8'), function (err, result) {
                def.resolve(err ? content : result);
            });
            return def.promise();
        },

        removeDir: function (p) {
            var def = vow.defer();
            fsExtra.remove(p, function (err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        },

        copyDir: function(source, target) {
            var def = vow.defer();
            fsExtra.copy(source, target, function (err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        },

        getDataLink: function() {
            var provider = config.get('provider'),
                host,
                port;

            if (!provider) {
                logger.warn('Provider is not configured for application. Update will be skipped');
                return null;
            }

            host = provider.host;
            port = provider.port;

            if (!host) {
                logger.warn('Provider host name is not configured for application. Update will be skipped');
                return null;
            }

            if (!port) {
                logger.warn('Provider port number is not configured for application. Update will be skipped');
                return null;
            }

            return url.format({
                protocol: 'http',
                hostname: host,
                port: port,
                pathname: '/data/' + config.get('NODE_ENV')
            });
        },

        getPingLink: function() {
            var provider = config.get('provider'),
                host,
                port;

            if (!provider) {
                logger.warn('Provider is not configured for application. Update will be skipped');
                return null;
            }

            host = provider.host;
            port = provider.port;

            if (!host) {
                logger.warn('Provider host name is not configured for application. Update will be skipped');
                return null;
            }

            if (!port) {
                logger.warn('Provider port number is not configured for application. Update will be skipped');
                return null;
            }

            return url.format({
                protocol: 'http',
                hostname: host,
                port: port,
                pathname: '/ping/' + config.get('NODE_ENV')
            });
        },

        putPageToCache: function(req, pageContent) {
            var pagePath = path.join(constants.PAGE_CACHE, req.__data.node.url);
            return vowFs.makeDir(pagePath).then(function () {
                return this.zip(pageContent).then(function(archive) {
                    return vowFs.write(path.join(pagePath, req.lang + '.html.gzip'), archive, 'utf8');
                });
            }, this);
        },

        clearPageCache: function() {
            return vowFs.exists(constants.PAGE_CACHE).then(function (exists) {
                return exists ? this.removeDir(constants.PAGE_CACHE) : vow.resolve();
            }, this);
        }
    });
});
