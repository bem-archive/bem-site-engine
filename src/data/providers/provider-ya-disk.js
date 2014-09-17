var util = require('util'),

    disk = require('yandex-disk'),
    vow = require('vow'),

    logger = require('../logger'),
    config = require('../config');

var YaDiskProvider = function() {
    this.init();
};

YaDiskProvider.prototype = {

    disk: null,

    /**
     * Initialize Yandex Disk API with configuration
     */
    init: function() {
        logger.debug('Initialize Yandex Disk provider', module);
        try {
            this.disk = new disk.YandexDisk(
                config.get('yandexApi:login'),
                config.get('yandexApi:password')
            );
        }catch(err) {
            logger.error(util.format('Can not initialize Yandex Disk API %s', err.message), module);
        }
    },

    /**
     * Reads file from yandex disk
     * @param options - {Object} object with fields
     * - path {String} path to file
     * @returns {*}
     */
    load: function(options) {
        logger.debug(util.format('load file from %s', options.path), module);
        var def = vow.defer();
        this.disk.readFile(options.path, 'utf8', function (err, content) {
            (err || !content) ? def.reject(err) : def.resolve(content);
        });
        return def.promise();
    },

    /**
     * Downloads file from yandex disk to filesystem
     * @param options {Object} object with fields:
     * - source {String} path to source file
     * - target {String} path to target directory
     * @param options
     * @returns {*}
     */
    downloadFile: function(options) {
        logger.debug(util.format('download file from %s to %s', options.source, options.target), module);
        var def = vow.defer();
        this.disk.downloadFile(options.source, options.target, function(err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    },

    /**
     * Uploads directory to Yandex Disk
     * * @param options {Object} object with fields:
     * - source {String} path to source directory
     * - target {String} path to target directory
     * @returns {*}
     */
    uploadDir: function(options) {
        logger.debug(util.format('upload directory from %s to %s', options.source, options.target), module);
        var def = vow.defer();
        this.disk.uploadDir(options.source, options.target, function(err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    },

    /**
     * Creates remote file on yandex disk
     * @param options {Object} object with fields:
     * - path {String} path for file
     * - data {String} content for file
     * @returns {*}
     */
    save: function(options) {
        var self = this,
            def = vow.defer();

        logger.debug(util.format('save data to %s', options.path), module);
        this.disk.writeFile(options.path, options.data, 'utf8', function(err) {
            if(err) {
                def.reject(err);
            }
            self.disk.exists(options.path, function(err, exists) {
                (err || !exists) ? def.reject(err) : def.resolve(exists);
            });
        });
        return def.promise();
    },

    /**
     *
     * Copy files on Yandex Disk
     * @param options {Object} object with fields:
     * - source {String} path to source file
     * - target {String} path to target file
     * @returns {*}
     */
    copy: function(options) {
        logger.debug(util.format('copy files from %s to %s', options.source, options.target), module);
        var def = vow.defer();
        this.disk.copy(options.source, options.target, function(err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    },

    /**
     * Creates directory on Yandex disk
     * @param options {Object} object with fields:
     * - path {String} path to directory
     * @returns {*}
     */
    makeDir: function(options) {
        logger.debug(util.format('make directory %s', options.path), module);
        var def = vow.defer();
        this.disk.mkdir(options.path, function(err) {
            err ? def.reject(err) : def.resolve();
        });
        return def.promise();
    },

    /**
     * Read list of files and directories for current directory
     * @param options {Object} object with fields:
     * - path {String} path to directory
     * @returns {*}
     */
    listDir: function(options) {
        logger.debug(util.format('read content of directory %s', options.path), module);
        var def = vow.defer();
        this.disk.readdir(options.path, function(err, result) {
            (err || !result) ? def.reject(err) : def.resolve(result);
        });
        return def.promise();
    }
};

exports.YaDiskProvider = YaDiskProvider;
