var worker = require('luster'),
    logger = require('../logger')(module),
    data = require('../modules').data,
    app = require('../app');

if (worker.isWorker) {
    logger.debug('start worker process %s', worker.wid);

    worker.registerRemoteCommand('reloadCache', function(target, workerId) {
        logger.info('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId);
        data.docs.reload();
    });

    app.run()
        .then(function() {
            logger.info('start application for worker with id %s on port %s', worker.wid, process.env.port);
        })
        .fail(function(err) {
            logger.error(err);
        });
}
