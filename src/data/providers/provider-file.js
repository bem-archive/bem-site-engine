var _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    fsExtra = require('fs-extra'),

    logger = require('../lib/logger')(module);

exports.FileProvider = function() {

    /**
     * Returns loaded content of file
     * @param options - {Object} with fields
     * - path {String} path to file
     * @returns {vow promise object}
     */
    this.load = function(options) {
        logger.debug('load data from file file %s', options.path);
        return vowFs.read(options.path, 'utf-8');
    };

    /**
     * Save data object into file
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * - data {String} content for file
     * @returns {vow promise object}
     */
    this.save = function(options) {
        logger.debug('save data to file file %s', options.path ? options.path : 'unknown file');
        return vowFs.write(options.path, options.data, 'utf8');
    };

    /**
     * Copy file from one place on filesystem to another
     * @param options - {Object} with fields:
     * - source {String} path to source file
     * - target {String} path to target file
     * @returns {*}
     */
    this.copy = function(options) {
        logger.debug('copy file %s to %s', options.source, options.target);
        return vowFs.copy(options.source, options.target);
    };

    /**
     * Creates new directory on filesystem
     * @param options - {Object} with fields:
     * - path {String} path to directory that should be created
     * @returns {*}
     */
    this.makeDir = function(options) {
        logger.debug('create directory %s', options.path);
        return vowFs.makeDir(options.path);
    };

    /**
     * Returns list of files and directories for current path
     * @param options - {Object} with fields:
     * - path {String} path of directory
     * @returns {*}
     */
    this.listDir = function(options) {
        logger.debug('list of directories for path %s', options.path);
        return vowFs.listDir(options.path);
    };

    /**
     * Removes directory with all files and subdirectories
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * @returns {*}
     */
    this.removeDir = function(options) {
        logger.debug('remove directory for path %s', options.path);

        var def = vow.defer();
        fsExtra.remove(options.path, function (err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    };
};
