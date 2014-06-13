'use strict';

var logger = require('./lib/logger')(module);

module.exports = require('coa').Cmd()
    .name(process.argv[1])
    .title('Bem-Site engine data builder')
    .helpful()
    .opt()
        .name('environment').title('Environment for data compiling. May be "dev", "testing" or "production"')
        .short('env').long('environment')
        .req()
        .def('dev')
        .val(function(v) {
            if (!/^dev$|^testing$|^production$/.test(v)) {
                logger.error('Invalid environment option value. May be only "dev", "testing" or "production"');
                return this.reject('fail');
            }
            return v;
        })
        .end()
    .opt()
        .name('version').title('Version of snapshots')
        .short('v').long('version')
        .val(function(v) {
            if(!/^latest$|^previous$|^-\d*$|^0$|^snapshot_\d{1,2}:\d{1,2}:201\d-\d{1,2}:\d{1,2}:\d{1,2}$/.test(v)) {
                logger.error('Invalid version option value. May be 0, negative number, "latest" or "previous"');
                return this.reject('fail');
            }
            return v;
        })
        .end()
    .act(function(opts) {
        logger.info('Try to compile data:');
        logger.info('environment: %s', opts.environment);
        logger.info('version: %s', opts.version);

        require('./index.js').run(process.cwd() + '/model', {
            environment: opts.environment,
            version: opts.version
        });
    });

