var vow = require('vow'),
    fs = require('vow-fs'),

    logger = require('../../../logger')(module);

var MSG = {
    DEBUG: {
        LOAD: 'load data from file file %s',
        SAVE: 'save data to file file %s'
    }
};

module.exports = {

    /**
     * Returns loaded and parsed content of json file
     * @param options - {Object} with fields
     * - path {String} path to file
     * @returns {vow promise object}
     */
    load: function(options) {
        logger.debug(MSG.DEBUG.LOAD, options.path);
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
        logger.debug(MSG.DEBUG.SAVE, options.path ? options.path : 'unknown file');
        return fs.write(options.path, options.data, 'utf8');
    }
};