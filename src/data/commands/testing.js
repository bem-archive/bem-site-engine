'use strict';

var util = require('util'),
    path = require('path'),

    vow = require('vow'),
    vowFs = require('vow-fs'),

    logger = require('../logger');

module.exports = function () {
    return this
        .title('testing')
        .helpful()
        .opt()
            .name('version').title('Version of snapshot')
            .short('v').long('version')
            .val(function(v) {
                if(!/^latest$|^previous$|^-\d*$|^0$|^snapshot_\d{1,2}:\d{1,2}:201\d-\d{1,2}:\d{1,2}:\d{1,2}$/.test(v)) {
                    logger.error('Invalid version option value. ' +
                    'May be 0, negative number, "latest" or "previous"', module);
                    return this.reject('fail');
                }
                return v;
            })
            .end()
        .act(function (opts) {
            var env = 'testing',
                symlinkPath = path.join(process.cwd(), 'configs', 'current');

            logger.info(util.format('TRY TO COMPILE DATA FOR %s ENVIRONMENT. VERSION: %s', env, opts.version || 'latest'), module);
            return vowFs.exists(symlinkPath)
                .then(function(exists) {
                    return exists ? vowFs.remove(symlinkPath) : vow.resolve();
                })
                .then(function() {
                    return vowFs.symLink(path.join(process.cwd(), 'configs', env), symlinkPath, 'dir');
                })
                .then(function() {
                    return require('../common').makeForTesting(opts.version, env);
                })
                .then(function() {
                    logger.info('DATA HAS BEEN COMPILED SUCCESSFULLY FOR TESTING ENVIRONMENT', module);
                })
                .fail(function(err) {
                    logger.error('DATA COMPILATION FAILED WITH ERROR', module);
                    logger.error(err.message, module);
                });
        });
};


