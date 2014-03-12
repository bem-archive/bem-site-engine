var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),
    logger = require('../logger')(module),
    dataUpdater = require('../modules/data_updater'),
    config = require('../config'),
    socket = config.get('app:socket');

var DIRS = {
    CACHE: 'cache',
    BRANCH: 'branch',
    TAG: 'tag'
};

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

    vowFs.chmod(process.cwd(), '0777')
        .then(function() {
            logger.debug('Create cache directories and sub-directories');

            return vow.all([
                vowFs.makeDir(path.join(DIRS.CACHE, DIRS.BRANCH)),
                vowFs.makeDir(path.join(DIRS.CACHE, DIRS.TAG))
            ]);
        })
        .then(function() {
            //optional enable cron updater
            if(config.get('update:enable')) {
                dataUpdater.init(luster).start(luster);
            }

            logger.info('luster: master process started');
        });
}

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
