var app = require('./app'),
    util = require('./util'),
    logger = require('./logger')(module);

if ('production' === process.env.NODE_ENV) {
    var worker = require('luster'),
        leData = require('./le-data');

    app.run(worker).then(function() {
        worker.registerRemoteCommand('reloadCache', function(target, workerId) {
            logger.info('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId);
            leData.dropCache();
        });
    });
} else {
    util.createDirectory('logs').then(function() {
        return app.run();
    });
}
