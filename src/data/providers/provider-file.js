var _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    fsExtra = require('fs-extra');

exports.FileProvider = function() {

    /**
     * Returns loaded content of file
     * @param options - {Object} with fields
     * - path {String} path to file
     * @returns {vow promise object}
     */
    this.load = function(options) {
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
        return vowFs.copy(options.source, options.target);
    };

    /**
     * Creates new directory on filesystem
     * @param options - {Object} with fields:
     * - path {String} path to directory that should be created
     * @returns {*}
     */
    this.makeDir = function(options) {
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
        return vowFs.remove(options.path);
    };

    this.exists = function(options) {
        return vowFs.exists(options.path);
    }
};
