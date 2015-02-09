var vow = require('vow'),
    YandexDisk = require('yandex-disk').YandexDisk;

modules.define('yandex-disk', function (provide) {

    var YD = function (options) {
            this.init(options);
        },
        yd;

    YD.prototype = {

        _options: undefined,
        _disk: undefined,

        /**
         * Initialize Yandex Disk module
         * @param {Object} options for Yandex Disk
         * @returns {*}
         */
        init: function (options) {
            if (!options) {
                return vow.resolve();
            }

            this._options = options;
            this._disk = new YandexDisk(options.user, options.password);
            return this;
        },

        /**
         * Check if Yandex Disk was initialized
         * @returns {boolean}
         */
        isInitialized: function () {
            return !!this._disk;
        },

        /**
         * Return namspace (root folder fo snapshots on Yandex Disk)
         * @returns {*}
         */
        getNamespace: function () {
            return this._options['namespace'];
        },

        /**
         * Reads content of file from yandex disk
         * @param {String} filePath - path to remote file on yandex disk
         * @returns {*}
         */
        readFile: function (filePath) {
            if (!this.isInitialized()) {
                return vow.resolve(null);
            }

            var def = vow.defer();
            this._disk.readFile(filePath, 'utf-8', function (err, content) {
                err ? def.reject(err) : def.resolve(content);
            });
            return def.promise();
        },

        /**
         * Downloads file from yandex disk
         * @param {String} remotePath - path to remote file on yandex disk
         * @param {String} localPath - destination path on local filesystem
         * @returns {*}
         */
        downloadFile: function (remotePath, localPath) {
            if (!this.isInitialized()) {
                return vow.resolve();
            }

            var def = vow.defer();
            this._disk.downloadFile(remotePath, localPath, function (err) {
                err ? def.reject(err) : def.resolve();
            });
            return def.promise();
        }
    };

    provide({
        init: function (options) {
            yd = new YD(options);
            return yd;
        },

        get: function () {
            return yd;
        }
    });
});
