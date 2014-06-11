modules.require(['app', 'logger', 'util'], function(app, logger, util) {
    logger = logger(module);

    var luster = util.isDev() ? { id: 'single', isWorker: true } : require('luster');

    if(luster.isWorker) {
        logger.debug('start worker process %s', luster.id);

        app.run()
            .then(function() {
                logger.info('start application for worker with id %s on port %s',
                    luster.id, process.env.port);
            })
            .fail(function(err) {
                logger.error(err);
            });
    }
});
