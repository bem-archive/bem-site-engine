var path = require('path'),

    vow = require('vow');

modules.define('util', ['constants', 'config'], function(provide, constants, config) {

    provide({

        /**
         * Checks if current environment is development
         * @returns {boolean}
         */
        isDev: function() {
            return 'development' === config.get('NODE_ENV');
        }
    });
});
