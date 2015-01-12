var util = require('util'),
    vow = require('vow'),

    assert = require('assert'),
    EventEmitter = require('events').EventEmitter,
    Client = require('cocaine').Client;

modules.define('storage', ['config', 'logger'], function(provide, config, logger) {

    logger = logger(module);

    var OPTIONS = {
            NAME_SPACE: 'defaultnamespace',
            HOST: 'apefront.tst.ape.yandex.net',
            PORT: 10053
        },
        ERROR_CODE_NOT_FOUND = 2,
        error = new Error('Storage has not been connected'),
        storage;

    function __uid() {
        return (Math.random() * 0x100000000).toString(36);
    }

    function Storage(options) {
        options = options || {};
        this._namespace = options.namespace || OPTIONS.NAME_SPACE;
        this._locator = options.locator || util.format('%s:%s', OPTIONS.HOST, OPTIONS.PORT);

        this._debug = options.debug || false;
        this._app = process.argv.app || 'defaultapp';
        this._logger = null;

        this._client = new Client(this._locator);
        this._storage = this._client.Service('storage');

        this.STATE = {
            DEFAULT: 0,
            CONNECTING: 1,
            CONNECTED: 2
        };

        this.state = this.STATE.DEFAULT;
        this.isInDefaultState = function () {
            return this.state === this.STATE.DEFAULT;
        };
        this.isInConnectedState = function () {
            return this.state === this.STATE.CONNECTED;
        };
    }

    util.inherits(Storage, EventEmitter);

    Storage.prototype._log = function () {
        if (this._debug) {
            this._logger.debug.apply(this._logger, arguments);
        }
    };

    /**
     * Connect to storage
     */
    Storage.prototype.connect = function () {
        var _this = this;

        this.state = this.STATE.CONNECTING;

        if (this._debug) {
            _connectLogger();
        } else {
            _connectStorage();
        }

        function _connectLogger() {
            _this._logger = _this._client.Logger(_this._app);
            _this._logger.connect();
            _this._logger.once('connect', function () {
                _this._logger._verbosity = 4;
                _connectStorage();
            });
        }

        function _connectStorage() {
            var id = __uid();
            _this._log('[%s] connecting to storage service', id);
            _this._storage.connect();
            _this._storage.once('connect', function () {
                assert(_this.state === _this.STATE.CONNECTING);
                _this._log('[%s] connected to storage', id);
                _this.state = _this.STATE.CONNECTED;
                _this.emit('connect');
            });
        }
    };

    /**
     * Reads record for key
     * @param {String} key - record key
     * @param {Function} cb - callback function
     */
    Storage.prototype.read = function (key, cb) {
        this._storage.read(this._namespace, key, function (err, result) {
            cb(err, result);
        });
    };

    provide({

        /**
         * Initialize cocaine storage
         * @returns {*}
         */
        init: function () {
            logger.info('Initialize cocaine storage');
            if (storage && !storage.isInDefaultState()) {
                return vow.resolve();
            }

            storage = new Storage(config.get('storage:cocaine'));
            storage.connect();

            var def = vow.defer();
            storage.on('connect', function (err) {
                err ? def.reject(err) : def.resolve();
            });

            return def.promise();
        },

        /**
         * Reads data from storage by key
         * @param {String} key - record key
         * @returns {*}
         */
        read: function (key) {
            if (!storage.isInConnectedState()) {
                return vow.reject(error);
            }

            var def = vow.defer();
            storage.read(key, function (err, value) {
                if (!err) {
                    def.resolve(value);
                }else if (err.code === ERROR_CODE_NOT_FOUND) {
                    def.resolve(null);
                }else {
                    def.reject(err);
                }
            });

            return def.promise();
        }
    });
});
