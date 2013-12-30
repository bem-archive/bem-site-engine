var app = require('./app');

if ('production' === process.env.NODE_ENV) {
    var worker = require('luster'),
        leData = require('./le-data');

    app.run(worker).then(function() {
        worker.registerRemoteCommand('reloadCache', function(target, workerId) {
            console.log('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId);
            leData.dropCache();
        });
    });
} else {
    app.run();
}
