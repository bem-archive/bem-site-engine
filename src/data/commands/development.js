'use strict';

var util = require('util'),

    vow = require('vow'),

    logger = require('../logger'),
    providers = require('../providers'),
    utility = require('../util'),
    common = require('../common');

module.exports = function () {
    return this
        .title('development')
        .helpful()
        .opt()
            .name('version').title('Version of snapshot')
            .short('v').long('version')
            .val(function(v) {
                if(!utility.isVersionValid(v)) {
                    logger.error('Invalid version option value. ' +
                    'May be 0, negative number, "latest" or "previous"', module);
                    return this.reject('fail');
                }
                return v;
            })
            .end()
        .act(function (opts) {
            logger.info(util.format('Try to compile data for development environment version: %s', opts.version), module);
            return utility.switchConfig('dev')
                .then(function() {
                    return opts.version ? vow.resolve() : common.makeSnapshot();
                })
                .then(function() {
                    return common.setSnapshotActive(providers.getProviderFile(), '', opts.version);
                });
        });
};

