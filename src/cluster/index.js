var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),

    logger = require('../logger')(module),
    modules = require('../modules'),
    config = require('../config');

if (luster.isMaster) {
    logger.info('luster: master process start');

    var socket = config.get('app:luster:server:port');

    if (socket) {
        try {
            logger.debug('luster: unlink socket %s', socket);
            fs.unlinkSync(socket);
        } catch (e) {
            logger.error('Can\'t unlink socket %s', socket);
        }
    }

    vow.all([
            vowFs.makeDir(path.join(modules.constants.DIRS.CACHE, modules.constants.DIRS.BRANCH)),
            vowFs.makeDir(path.join(modules.constants.DIRS.CACHE, modules.constants.DIRS.TAG))
        ])
        .then(
            function() {
                //optional enable cron updater
                if(config.get('app:update:enable')) {
                    modules.updater.init(luster).start(luster);
                }

                logger.info('luster: master process started');
            },
            function() {
                logger.error('Can not create cache folder and it subfolders');
            }
        );
}

try {
    luster.configure({
        app: require.resolve('./worker'),
        workers: config.get('app:luster:workers'),
        control: config.get('app:luster:control'),
        server: config.get('app:luster:server')
    }, true, __dirname);
}catch(err) {
    logger.error('Error luster initialization');
}

module.exports = luster;
