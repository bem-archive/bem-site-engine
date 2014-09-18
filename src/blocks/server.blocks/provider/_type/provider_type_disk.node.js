var YandexDisk = require('yandex-disk'),
    vow = require('vow');

modules.define('providerDisk', ['logger', 'config', 'util'], function(provide, logger, config, util) {

    logger = logger(module);

    var disk;

    provide({
        init: function() {
            disk = new YandexDisk.YandexDisk(
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
                def.resolve(options.archive ? util.unzip(content) : content);
            });
            return def.promise();
        },

        /**
         * Downloads file from yandex disk to local filesystem
         * @param options - {Object} with fields
         * - source {String} source path on Yandex Disk
         * - target {String} target path on local filesystem
         * @returns {*}
         */
        downloadFile: function(options) {
            logger.debug('read file %s from yandex disk to %s', options.source, options.target);
            var def = vow.defer();
            disk.downloadFile(options.source, options.target, function(err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        }
    });
});
