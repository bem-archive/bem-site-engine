var path = require('path'),
    u = require('util'),

    yandex_disk = require('yandex-disk'),
    vow = require('vow'),

    logger = require('../../../logger')(module),
    config = require('../../../config');

var disk;

module.exports = {

    init: function() {
        disk = new yandex_disk.YandexDisk(
            config.get('yandexApi:login'),
            config.get('yandexApi:password')
        );
    },

    /**
     * Reads file from yandex disk
     * @param options - {Object} object with fields
     * - path {String} path to file
     * @returns {*}
     */
    readFile: function(options) {
        logger.debug('read file %s from yandex disk', options.path);

        var def = vow.defer();

        disk.readFile(options.path, 'utf8', function(err, content) {
            if(err || !content) {
                def.reject(err);
            }

            def.resolve(content);
        });

        return def.promise();
    },

    /**
     * Creates remote file on yandex disk
     * @param options {Object} objext with fields:
     * - path {String} path for file
     * - data {String} content for file
     * @returns {*}
     */
    writeFile: function(options) {
        logger.debug('write file %s to yandex disk', options.path);

        var def = vow.defer();

        disk.writeFile(options.path, options.data, 'utf8', function(err) {
            if(err) {
                def.reject(err)
            }
            disk.exists(options.path, function(err, exists) {
                if (err || !exists) {
                    def.reject(err);
                }

                def.resolve(exists);

            });
        });

        return def.promise();
    }
};
