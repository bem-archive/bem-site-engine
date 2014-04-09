var _ = require('lodash'),
    fs = require('vow-fs'),

    logger = require('../lib/logger')(module),
    BaseProvider = require('./provider-base').BaseProvider;

var FileProvider = function() {};

FileProvider.prototype = Object.create(BaseProvider.prototype);

/**
 * Returns loaded content of file
 * @param options - {Object} with fields
 * - path {String} path to file
 * @returns {vow promise object}
 */
FileProvider.prototype.load = function(options) {
    logger.debug('load data from file file %s', options.path);
    return fs.read(options.path, 'utf-8');
};

/**
 * Save data object into file
 * @param options - {Object} with fields:
 * - path {String} path to target file
 * - data {String} content for file
 * @returns {vow promise object}
 */
FileProvider.prototype.save = function(options) {
    logger.debug('save data to file file %s', options.path ? options.path : 'unknown file');
    return fs.write(options.path, options.data, 'utf8');
};

/**
 * Copy file from one place on filesystem to another
 * @param options - {Object} with fields:
 * - source {String} path to source file
 * - target {String} path to target file
 * @returns {*}
 */
FileProvider.prototype.copy = function(options) {
    logger.debug('copy file %s to %s', options.source, options.target);
    return fs.copy(options.source, options.target);
};

/**
 * Creates new directory on filesystem
 * @param options - {Object} with fields:
 * - path {String} path to directory that should be created
 * @returns {*}
 */
FileProvider.prototype.makeDir = function(options) {
    logger.debug('create directory %s', options.path);
    return fs.makeDir(options.path);
};


exports.FileProvider = FileProvider;