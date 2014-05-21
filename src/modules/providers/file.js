var vow = require('vow'),
    fs = require('vow-fs'),
    fsExtra = require('fs-extra'),
    logger = require('../../logger')(module);

module.exports = {

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
     * Removes directory with all files and subdirectories
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * @returns {*}
     */
    removeDir: function(options) {
        var def = vow.defer();
        fsExtra.remove(options.path, function(err) {
            if(err) {
                def.reject(err);
            }

            def.resolve();
        });

        return def.promise();
    }
};