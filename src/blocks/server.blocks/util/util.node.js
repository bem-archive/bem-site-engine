var path = require('path'),

    vow = require('vow'),
    vowFs = require('vow-fs');

modules.define('util', ['constants', 'config', 'providerFile', 'providerDisk'], function(provide, constants, config, providerFile, providerDisk) {

    provide({

        isDev: function() {
            return 'development' === config.get('NODE_ENV');
        }
    });
});
