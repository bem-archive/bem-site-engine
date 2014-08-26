var vow = require('vow'),
    fs = require('vow-fs'),
    fsExtra = require('fs-extra');

modules.define('providerFile', ['logger'], function(provide, logger) {

    logger = logger(module);

    provide({

        init: function() {
            //stub method
        },

        /**
         * Returns loaded and parsed content of json file
         * @param options - {Object} with fields
         * - path {String} path to file
         * @returns {vow promise object}
         */
        load: function(options) {
            logger.debug('load data from file file %s', options.path);
            return fs.read(options.path, 'utf-8');
        },

        /**
         * Stringify and save data object into json file
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * - data {String} content for file
         * @returns {vow promise object}
         */
        save:  function(options) {
            logger.debug('save data to file file %s', options.path ? options.path : 'unknown file');
            return fs.write(options.path, options.data, 'utf8');
        },

        /**
         * Makes directory for given options
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * @returns {*}
         */
        makeDir: function(options) {
            logger.debug('make directory %s', options.path);
            return fs.makeDir(options.path);
        },

        /**
         * Removes directory with all files and subdirectories
         * @param options - {Object} with fields:
         * - path {String} path to target file
         * @returns {*}
         */
        removeDir: function(options) {
            logger.debug('remove directory %s', options.path);

            var def = vow.defer();
            fsExtra.remove(options.path, function(err) {
                if(err) {
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
        remove: function(options) {
            logger.debug('remove file %s', options.path);
            return fs.remove(options.path);
        },

        exists: function(options) {
            return fs.exists(options.path);
        }
    });
});
