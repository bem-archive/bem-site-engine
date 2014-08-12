var path = require('path'),
    fs = require('fs'),

    luster = require('luster'),

    util = require('./util'),
    config = require('./config'),
    updater = require('./updater'),
    providers = require('../data/providers');

function unlinkSocket() {
    var socket = config.get('app:luster:server:port');

    if(socket) {
        try {
            fs.unlinkSync(socket);
        } catch (e) {
            console.error('Can\'t unlink socket %s', socket);
        }
    }
}

module.exports = function() {
    luster.configure({
        app: require.resolve('./worker.js'),
        workers: config.get('app:luster:workers'),
        control: config.get('app:luster:control'),
        server: config.get('app:luster:server')
    }, true, __dirname).run();

    if(luster.isMaster) {
        console.info('luster: master process start');

        unlinkSocket();
        updater.init(luster);
        config.get('app:update:enable') && updater.start();
    }
};
