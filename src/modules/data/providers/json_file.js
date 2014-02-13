var vow = require('vow'),
    fs = require('vow-fs'),

    logger = require('../../../logger')(module);

module.exports = {

    /**
     * Returns loaded and parsed content of json file
     * @param options - {Object} with fields
     * - path {String} path to file
     * @returns {Object}
     */
    load: function(options) {
        logger.debug('load data from json file %s', options.path);

        return fs.read(options.path, 'utf-8')
            .then(
            function(content) {
                return JSON.parse(content);
            },
            function() {
                logger.warn('cannot read content of %s file', options.path);
            }
        );
    },

    /**
     * Stringify and save data object into json file
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * - data {Object} content for file
     * @returns {*}
     */
    save:  function(options) {
        logger.debug('save data to json file %s', options.path ? options.path : 'unknown file');
        return fs.write(options.path, JSON.stringify(options.data, null, 4), 'utf8');
    }
};
