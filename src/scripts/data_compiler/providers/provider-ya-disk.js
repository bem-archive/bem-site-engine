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
        config.get('yandexApi:login'),
        config.get('yandexApi:password')
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
 * @param options {Object} objext with fields:
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

YaDiskProvider.prototype.copy = function(options) {

};

YaDiskProvider.prototype.makeDir = function(options) {

};

exports.YaDiskProvider = YaDiskProvider;