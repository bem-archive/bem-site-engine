var path = require('path'),

    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    fsExtra = require('fs-extra'),
    zlib = require('zlib');

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

        /**
         * Zip given string content
         * @param {String} content - data for zipping
         * @returns {*}
         */
        zip: function (content) {
            var def = vow.defer();
            zlib.gzip(new Buffer(content, 'utf-8'), function (err, result) {
                def.resolve(err ? content : result);
            });
            return def.promise();
        },

        /**
         * Unzip given zipped content
         * @param {String} content - zipped data
         * @returns {*}
         */
        unzip: function (content) {
            var def = vow.defer();
            zlib.gunzip(new Buffer(content, 'utf-8'), function (err, result) {
                def.resolve(err ? content : result);
            });
            return def.promise();
        },

        /**
         * Removes all files and folders from given path
         * @param {String} p - path that should be removed
         * @returns {*}
         */
        removeDir: function (p) {
            var def = vow.defer();
            fsExtra.remove(p, function (err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        },

        /**
         * Copy all files from source folder to target folder
         * @param {String} source - path to source folder
         * @param {String} target - path to target folder
         * @returns {*}
         */
        copyDir: function (source, target) {
            var def = vow.defer();
            fsExtra.copy(source, target, function (err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        },

        /**
         * Save html code of pages as cached files
         * @param {Object} req - request object
         * @param {String} pageContent - html code of page
         * @returns {*}
         */
        putPageToCache: function (req, pageContent) {
            var pagePath = path.join(constants.PAGE_CACHE, req.__data.node.url);
            return vowFs.makeDir(pagePath).then(function () {
                return this.zip(pageContent).then(function (archive) {
                    return vowFs.write(path.join(pagePath, req.lang + '.html.gzip'), archive, 'utf8');
                });
            }, this);
        },

        /**
         * Clears folder with html pages
         * @returns {*}
         */
        clearPageCache: function () {
            return vowFs.exists(constants.PAGE_CACHE).then(function (exists) {
                return exists ? this.removeDir(constants.PAGE_CACHE) : vow.resolve();
            }, this);
        },
        
        /**
         * Get domain without subdomain and port/socket
         * @param host -> ru.bem.info || en.bem.info || bem.info:3015
         * @returns {string} -> e.g. bem.info
         */
        getDomain: function(host) {
            if (!host || host.indexOf('localhost') > -1) return '';
            return host.split(':')[0].replace(/^(en|ru)\./, '');
        }
    });
});
