var _ = require('lodash'),

    yandex_disk = require('yandex-disk'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    BaseProvider = require('./provider-base').BaseProvider;

var _disk;

var YaDiskProvider = function() {
    this.init();
};

YaDiskProvider.prototype = Object.create(BaseProvider.prototype);

YaDiskProvider.prototype.init = function() {
    _disk = new yandex_disk.YandexDisk(
        config.get('common:yandexApi:login'),
        config.get('common:yandexApi:password')
    );
};

/**
 * Reads file from yandex disk
 * @param options - {Object} object with fields
 * - path {String} path to file
 * @returns {*}
 */
YaDiskProvider.prototype.load = function(options) {
    logger.debug('read file %s from yandex disk', options.path);

    var def = vow.defer();

    _disk.readFile(options.path, 'utf8', function (err, content) {
        if (err || !content) {
            def.reject(err);
        }
        def.resolve(content);
    });

    return def.promise();
};

/**
 * Creates remote file on yandex disk
 * @param options {Object} object with fields:
 * - path {String} path for file
 * - data {String} content for file
 * @returns {*}
 */
YaDiskProvider.prototype.save = function(options) {
    logger.debug('write file %s to yandex disk', options.path);

    var def = vow.defer();

    _disk.writeFile(options.path, options.data, 'utf8', function(err) {
        if(err) {
            def.reject(err)
        }
        _disk.exists(options.path, function(err, exists) {
            if (err || !exists) {
                def.reject(err);
            }
            def.resolve(exists);

        });
    });

    return def.promise();
};

/**
 *
 * Copy files on Yandex Disk
 * @param options {Object} object with fields:
 * - source {String} path to source file
 * - target {String} path to target file
 * @returns {*}
 */
YaDiskProvider.prototype.copy = function(options) {
    logger.debug('copy %s to %s on yandex disk', options.source, options.target);

    var def = vow.defer();

    _disk.copy(options.source, options.target, function(err) {
        if (err) {
            def.reject(err);
        }
        def.resolve();
    });

    return def.promise();
};

/**
 * Creates directory on Yandex disk
 * @param options {Object} object with fields:
 * - path {String} path to directory
 * @returns {*}
 */
YaDiskProvider.prototype.makeDir = function(options) {
    logger.debug('make directory %s on yandex disk', options.path);

    var def = vow.defer();

    _disk.mkdir(options.path, function(err) {
        if (err) {
            def.reject(err);
        }
        def.resolve();
    });

    return def.promise();
};

/**
 * Read list of files and directories for current directory
 * @param options {Object} object with fields:
 * - path {String} path to directory
 * @returns {*}
 */
YaDiskProvider.prototype.listDir = function(options) {
    logger.debug('read directory %s on yandex disk', options.path);

    var def = vow.defer();

    _disk.readdir(options.path, function(err, result) {
        if (err || !result) {
            def.reject(err);
        }
        def.resolve(result);
    });

    return def.promise();
};

exports.YaDiskProvider = YaDiskProvider;
