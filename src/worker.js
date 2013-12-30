var worker = require('luster'),
    leData = require('./le-data'),
    app = require('./app');

app.run(worker).then(function() {
    worker.registerRemoteCommand('reloadCache', function(target, workerId) {
        console.log('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId);
        leData.dropCache();
    });
});
