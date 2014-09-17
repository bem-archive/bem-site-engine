'use strict';

var util = require('util'),

    logger = require('../logger'),
    providers = require('../providers'),
    utility = require('../util'),
    common = require('../common');

module.exports = function () {
    return this
        .title('production')
        .helpful()
        .opt()
            .name('version').title('Version of snapshot')
            .short('v').long('version')
            .val(function(v) {
                if(!utility.isVersionValid(v)) {
                    logger.error(util.format('Invalid version option value. ' +
                    'May be 0, negative number, "latest" or "previous"'), module);
                    return this.reject('fail');
                }
                return v;
            })
            .req()
            .end()
        .act(function (opts) {
            var env = 'production';
            logger.info(util.format('Try to compile data for %s environment version: %s', env, opts.version), module);
            return utility.switchConfig(env).then(function() {
                return common.setSnapshotActive(providers.getProviderYaDisk(), env, opts.version);
            });
        });
};


