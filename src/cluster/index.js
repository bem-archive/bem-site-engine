var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),
    logger = require('../logger')(module),
    dataUpdater = require('../modules/data_updater'),
    config = require('../config'),
    constants = require('../modules/constants'),
    socket = config.get('app:socket');

if (luster.isMaster) {
    logger.info('luster: master process start');

    var socket = config.get('app:socket');

    if (socket) {
        try {
            logger.debug('luster: unlink socket %s', socket);
            fs.unlinkSync(socket);
        } catch (e) {
            logger.error('Can\'t unlink socket %s', socket);
        }
    }

    vow.all([
            vowFs.makeDir(path.join(constants.DIRS.CACHE, constants.DIRS.BRANCH)),
            vowFs.makeDir(path.join(constants.DIRS.CACHE, constants.DIRS.TAG))
        ])
        .then(
            function() {
                //optional enable cron updater
                if(config.get('update:enable')) {
                    dataUpdater.init(luster).start(luster);
                }

                logger.info('luster: master process started');
            },
            function() {
                logger.error('Can not create cache folder and it subfolders');
            }
        );
}

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
