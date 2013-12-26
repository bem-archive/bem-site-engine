var fs = require('fs'),
    express = require('express'),
    worker = require('luster'),
    util = require('util'),
    config = require('./config'),
    router = require('./router'),
    middleware = require('./middleware'),
    leData = require('./le-data');

var createWorker = function() {
    leData.init().getData()
        .then(function() {
            var portOrSocket = config.get('app:socket') || config.get('app:port');

            var app = express()
                .use(express.logger(config.get('app:logger:mode')))
                .use(express.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.router(router))
                .use(middleware.reloadCache(router))
                .use(middleware.page())
                .use(middleware.error()).listen(portOrSocket, function() {
                    if(isNaN(+portOrSocket)) {
                        fs.chmod(portOrSocket, '0777');
                    }
                });
        })
        .then(function() {
            worker.registerRemoteCommand('reloadCache', function(target, workerId) {
                console.log(util.format('worker %s receive message reloadCache initialized by worker %s', target.wid, workerId));
                leData.dropCache();
            });
        });
};


exports.run = (function() {
    return createWorker();
})();
