var path = require('path'),
    u = require('util'),

    yandex_disk = require('yandex-disk'),
    vow = require('vow'),

    logger = require('../../logger')(module),
    config = require('../../config');

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
    load: function(options) {
        logger.debug('read file %s from yandex disk', options.path);

        var def = vow.defer();

        disk.readFile(options.path, 'utf8', function(err, content) {
            if(err || !content) {
                def.reject(err);
            }

            def.resolve(content);
        });

        return def.promise();
    }
};
