var fs = require('fs'),
    luster = require('luster'),
    logger = require('../logger')(module),
    data_updater = require('../modules/data_updater'),
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

    //optional enable cron updater
    if(config.get('update:enable')) {
        data_updater.init(luster).start(luster);
    }

    logger.debug('luster: master process started');
}

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
