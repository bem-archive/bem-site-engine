var util = require('util'),

    vow = require('vow'),
    vowFs = require('vow-fs'),

    logger = require('../logger'),
    fsExtra = require('fs-extra');

exports.FileProvider = function() {

    /**
     * Returns loaded content of file
     * @param options - {Object} with fields
     * - path {String} path to file
     * @returns {*}
     */
    this.load = function(options) {
        logger.debug(util.format('load data from file %s', options.path), module);
        return vowFs.read(options.path, 'utf-8');
    };

    /**
     * Save data object into file
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * - data {String} content for file
     * @returns {*}
     */
    this.save = function(options) {
        logger.debug(util.format('save data to file %s', options.path), module);
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
        logger.debug(util.format('copy file from %s to %s', options.source, options.target), module);
        return vowFs.copy(options.source, options.target);
    };

    /**
     * Creates new directory on filesystem
     * @param options - {Object} with fields:
     * - path {String} path to directory that should be created
     * @returns {*}
     */
    this.makeDir = function(options) {
        logger.debug(util.format('make directory %s', options.path), module);
        return vowFs.makeDir(options.path);
    };

    /**
     * Returns list of files and directories for current path
     * @param options - {Object} with fields:
     * - path {String} path of directory
     * @returns {*}
     */
    this.listDir = function(options) {
        return vowFs.listDir(options.path);
    };

    /**
     * Removes directory with all files and subdirectories
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * @returns {*}
     */
    this.removeDir = function(options) {
        logger.debug(util.format('remove directory from %s', options.path), module);
        var def = vow.defer();
        fsExtra.remove(options.path, function (err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    };

    /**
     * Removes file
     * @param options - {Object} with fields:
     * - path {String} path to target file
     * @returns {*}
     */
    this.remove = function(options) {
        logger.debug(util.format('remove file from %s', options.path), module);
        return vowFs.remove(options.path);
    };

    this.exists = function(options) {
        return vowFs.exists(options.path);
    };
};
