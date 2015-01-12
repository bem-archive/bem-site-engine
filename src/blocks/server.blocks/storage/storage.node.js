var util = require('util'),
    WritableStream = require('stream').Writable,

    vow = require('vow'),
    request = require('request');

modules.define('storage', ['config', 'logger'], function(provide, config, logger) {

    logger = logger(module);

    provide({

        /**
         * Initialize storage
         * @returns {*}
         */
        init: function () {
            logger.info('Initialize storage');
            return vow.resolve();
        },

        /**
         * Reads data from storage by key
         * @param {String} key - record key
         * @param {Function} callback - callback function
         * @returns {*}
         */
        read: function (key, callback) {
            var libRepo = config.get('github:libraries'),
                url = util.format(libRepo.pattern, libRepo.user, libRepo.repo, libRepo.ref, key);

            var ws = new WritableStream();

            ws.chunks = [];
            ws._write = function (chunk, enc, next) {
                this.chunks.push(chunk);
                next();
            };
            ws.on('error', function (err) {
                callback(err);
            });

            ws.on('finish', function() {
                var buf = Buffer.concat(this.chunks);
                callback(null, buf);
            });

            request({ url: url }).pipe(ws);
        }
    });
});
