var luster = require('luster'),
    logger = require('../logger')(module),
    app = require('../app');

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