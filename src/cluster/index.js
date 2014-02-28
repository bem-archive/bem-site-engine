var fs = require('fs'),
    luster = require('luster'),
    logger = require('../logger')(module),
    data_updater = require('../modules/data_updater'),
    config = require('../config'),
    app = require('../app'),
    socket = config.get('app:socket');

if (luster.isMaster) {
    logger.debug('luster: master process start');

    var socket = config.get('app:socket');

    if (socket) {
        try {
            logger.debug('luster: unlink socket');
            fs.unlinkSync(socket);
        } catch (e) {}
    }

    data_updater.init(luster).start(luster);

    logger.debug('luster: master process started');
}

if (luster.isWorker) {
    logger.debug('start worker process %s', luster.id);

    app.run(luster)
        .then(function() {
            logger.info('start application for worker with id %s on port %s',
                luster.id, process.env.port);
        })
        .fail(function(err) {
            logger.error(err);
        });
}

luster.configure({
    app: require.resolve('./worker'),
    workers: config.get('luster:workers'),
    control: config.get('luster:control'),
    server: config.get('luster:server')
}, true, __dirname);

module.exports = luster;
