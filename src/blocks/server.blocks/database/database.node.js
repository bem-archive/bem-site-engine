var util = require('util'),
    path = require('path'),

    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs'),
    levelup = require('levelup');

modules.define('database', ['logger', 'constants', 'config'], function(provide, logger, constants, config) {
    logger = logger(module);

    var DB_NAME = 'leveldb',
        DB_OPTIONS = {
            keyEncoding: 'utf-8',
            valueEncoding: {
                encode: JSON.stringify,
                decode: function (val) {
                    try {
                        return JSON.parse(val);
                    } catch (err) {
                        return val;
                    }
                },
                buffer: false,
                type: 'custom'
            }
        },

        db = null;

    provide({
        /**
         * Initialize database
         */
        connect: function () {
            var def = vow.defer();

            logger.info('Initialize leveldb database', module);
            return vowFs
                .makeDir(path.join(process.cwd(), 'db'))
                .then(function () {
                    try {
                        db = levelup(path.join('db', DB_NAME));
                        logger.info('Database was initialized successfully');
                        def.resolve();
                    } catch (err) {
                        var message = util.format('Can not connect to leveldb database. Error: %s', err.message);
                        logger.error(message);
                        def.reject(message);
                    }
                    return def.promise();
                });
        },

        /**
         * Returns value by key
         * @param {String} key of record
         * @returns {Object} value of record
         */
        get: function (key) {
            logger.verbose(util.format('get: %s', key), module);

            var def = vow.defer();
            db.get(key, DB_OPTIONS, function (err, value) {
                if (err) {
                    if (err.type === 'NotFoundError') {
                        return def.resolve();
                    }
                    def.reject();
                }
                def.resolve(value);
            });
            return def.promise();
        },

        /**
         * Returns data by criteria
         * @param {Function} criteria function
         * @param {Object} config object for set type of data that should be returned
         * @returns {*}
         */
        _getByCriteria: function (criteria, config) {
            var def = vow.defer(),
                result = [];
            db.createReadStream(_.extend(DB_OPTIONS, config))
                .on('data', function (data) {
                    if (criteria(data)) {
                        result.push(data);
                    }
                })
                .on('error', function (err) {
                    def.reject(err);
                })
                .on('close', function () {
                    def.resolve(result);
                })
                .on('end', function () {
                    def.resolve(result);
                });
            return def.promise();
        },

        /**
         * Returns array of keys by criteria
         * @param {Function} criteria function
         * @returns {*}
         */
        getKeysByCriteria: function (criteria) {
            return this._getByCriteria(criteria, { keys: true, values: false });
        },

        /**
         * Returns array of values by criteria
         * @param {Function} criteria function
         * @returns {*}
         */
        getValuesByCriteria: function (criteria) {
            return this._getByCriteria(criteria, { keys: false, values: true });
        },

        getByCriteria: function (criteria) {
            return this._getByCriteria(criteria, { keys: true, values: true });
        },

        getByKeyPrefix: function (prefix) {
            return this.getByCriteria(function (record) {
                return record.key.indexOf(prefix) > -1;
            });
        }
    });
});
