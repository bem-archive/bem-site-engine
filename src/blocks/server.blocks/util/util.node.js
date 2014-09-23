var path = require('path'),
    fs = require('fs'),

    zlib = require('zlib'),
    _ = require('lodash'),
    vow = require('vow');

modules.define('util', ['logger', 'constants', 'config'], function(provide, logger, constants, config) {

    logger = logger(module);

    provide({

        /**
         * Checks if current environment is development
         * @returns {boolean}
         */
        isDev: function() {
            return 'development' === config.get('NODE_ENV');
        },

        /**
         * Set correct rights for socket file
         * @param socket - {String} path to socket file
         */
        chmodSocket: function(socket) {
            if(socket) {
                try {
                    fs.chmod(socket, '0777');
                }catch(e) {
                    logger.error('Can\'t chmod 0777 to socket');
                }
            }
        },

        /**
         * Unlink socket
         * @param socket - {String} path to socket file
         */
        unlinkSocket: function(socket) {
            try {
                fs.unlinkSync(socket);
            }catch(e) {
                logger.warn('Can\'t unlink socket %s', socket);
            }
        },

        /**
         * Returns array of configured app languages
         * @returns {*|string[]}
         */
        getLanguages: function() {
            return config.get('languages') || ['en'];
        },

        /**
         * Returns default application language
         * @returns {*|string}
         */
        getDefaultLanguage: function() {
            return config.get('defaultLanguage') || 'en';
        },

        unzip: function(content) {
            var def = vow.defer();
            zlib.gunzip(new Buffer(content, 'utf-8'), function(err, result) {
                def.resolve(err ? content : result);
            });
            return def.promise();
        },

        /**
         * Find node(s) which satisfy to criteria function
         * @param model - {Object} sitemap model object
         * @param criteria - {Function} criteria function
         * @param onlyFirst - {Boolean} flag for find only first node
         * @returns {*}
         */
        findNodesByCriteria: function(model, criteria, onlyFirst) {

            var result = [];

            if(!_.isObject(model)) {
                return result;
            }

            if(!_.isFunction(criteria)) {
                return result;
            }

            var isFound = function() {
                    return onlyFirst && result.length;
                },
                traverseTreeNodes = function(node) {
                    if(criteria.apply(node)) {
                        result.push(node);
                    }

                    if(!isFound() && node.items) {
                        node.items.forEach(function(item) {
                            traverseTreeNodes(item);
                        });
                    }
                };

            model.forEach(function(node) {
                if(isFound()) {
                    return;
                }
                traverseTreeNodes(node);
            });

            return onlyFirst ? result[0] : result;
        }
    });
});
