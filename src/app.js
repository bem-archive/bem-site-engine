var connect = require('connect'),
    cluster = require('cluster'),
    util = require('util'),
    config = require('./config'),
    router = require('./router'),
    middleware = require('./middleware'),
    leData = require('./le-data');

var createNode = function() {
    leData.init().getData()
        .then(function() {
            connect()
                .use(connect.logger(config.get('app:logger:mode')))
                .use(connect.query())
                .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
                .use(middleware.router(router))
                .use(middleware.reloadCache(router))
                .use(middleware.page())
                .use(middleware.error())
                .listen(config.get('app:port'));
        })
        .then(function() {
            process.on('message', function(message) {
                console.log(util.format('worker receive message %s', message));
                if (message === 'reloadCache') {
                    leData.dropCache();
                }
            });
        });
};

exports.run = (function() {
    var numOfWorkers = config.get('app:workers');

    if(cluster.isWorker){
        return createNode();
    }

    if(cluster.isMaster) {
        cluster.on('fork', function(worker) {
            console.log(util.format("A worker %s is forked", worker.id));
        });

        cluster.on('listening', function(worker, address) {
            console.log(util.format("A worker %s is now connected to address: %s port: %s", worker.id, address.address, address.port));
        });

        for(var i=0; i< numOfWorkers; i++) {
            cluster.fork()
        }

        for (var id in cluster.workers) {
            cluster.workers[id].on('message', function(message) {
                if (message === 'reload') {
                    console.log(util.format('receive reload cache notification from worker %s', this.id));
                    for (var _id in cluster.workers) {
                        cluster.workers[_id].send('reloadCache');
                    }
                }
                if (message === 'request') {
                    console.log(util.format('receive request from worker %s', this.id));
                }
            });
        }
    }
})();
