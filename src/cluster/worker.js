var worker = require('luster'),
    logger = require('./../logger')(module),
    app = require('./../app');

if (worker.isWorker) {
    worker.registerRemoteCommand('reloadCache', function(target, workerId) {
        logger.info('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId);
        leData.dropCache();
    });

    app.run()
        .fail(function(err) {
            logger.error(err);
        });
}
