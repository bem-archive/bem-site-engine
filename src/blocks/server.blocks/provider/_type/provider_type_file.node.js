var vow = require('vow'),
    vowFs = require('vow-fs'),
    fsExtra = require('fs-extra');

modules.define('providerFile', ['logger', 'util'], function (provide, logger, util) {

    logger = logger(module);

    provide({

        init: function () {
            // stub method
        },

        /**
         * Returns loaded and parsed content of json file
         * @param options - {Object} with fields
         * - path {String} path to file
         * @returns {vow promise object}
         */
        load: function (options) {
            logger.debug('load data from file %s', options.path);
            return vowFs.read(options.path)
                .then(function (buf) {
                    return options.archive ? util.unzip(buf) : vow.resolve(buf);
                })
                .then(function (content) {
                    return content.toString('utf-8');
                });
        },

        /**
         * Stringify and save data object into json file
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * - data {String} content for file
         * @returns {vow promise object}
         */
        save:  function (options) {
            logger.debug('save data to file file %s', options.path ? options.path : 'unknown file');
            var promise = options.archive ? util.zip(options.data) : vow.resolve(options.data);
            return promise.then(function (data) {
                return vowFs.write(options.path, data, 'utf8');
            });
        },

        /**
         * Makes directory for given options
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * @returns {*}
         */
        makeDir: function (options) {
            logger.debug('make directory %s', options.path);
            return vowFs.makeDir(options.path);
        },

        /**
         * Removes directory with all files and subdirectories
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * @returns {*}
         */
        removeDir: function (options) {
            logger.debug('remove directory %s', options.path);

            var def = vow.defer();
            fsExtra.remove(options.path, function (err) {
                if (err) {
                    def.reject(err);
                }
                def.resolve();
            });
            return def.promise();
        },

        /**
         * Removes file with given options
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * @returns {*}
         */
        remove: function (options) {
            logger.debug('remove file %s', options.path);
            return this.exists(options).then(function (isExists) {
                if (isExists) {
                    return vowFs.remove(options.path);
                } else {
                    logger.warn('file %s does not exists', options.path);
                    return vow.resolve();
                }
            });
        },

        /**
         * Copy file from one place on filesystem to another
         * @param options - {Object} with fields:
         * - source {String} path to source file
         * - target {String} path to target file
         * @returns {*}
         */
        copy: function (options) {
            logger.debug('copy file from %s to %s', options.source, options.target);
            return vowFs.copy(options.source, options.target);
        },

        exists: function (options) {
            return vowFs.exists(options.path);
        }
    });
});
