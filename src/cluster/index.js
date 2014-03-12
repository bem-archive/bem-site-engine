var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),
    logger = require('../logger')(module),
    dataUpdater = require('../modules/data_updater'),
    config = require('../config'),
    socket = config.get('app:socket');

if (luster.isMaster) {
    logger.debug('luster: master process start');

    var socket = config.get('app:socket');

    if (socket) {
        try {
            logger.debug('luster: unlink socket');
            fs.unlinkSync(socket);
        } catch (e) {
            logger.error('Can\'t unlink socket');
        }
    }

    vowFs.chmod(process.cwd(), '0777')
        .then(function() {
            return vow.all([
                vowFs.makeDir(path.join('cache', 'branch')),
                vowFs.makeDir(path.join('cache', 'tag'))
            ]);
        })
        .then(function() {
            //optional enable cron updater
            if(config.get('update:enable')) {
                dataUpdater.init(luster).start(luster);
            }

            logger.debug('luster: master process started');
        });
}

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
