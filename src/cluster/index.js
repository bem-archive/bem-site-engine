var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),

    logger = require('../logger')(module),
    constants = require('../constants'),
    updater = require('./updater'),
    config = require('../config'),
    util = require('../util');

if (luster.isMaster) {
    logger.info('luster: master process start');

    var socket = config.get('app:luster:server:port');

    if (socket) {
        try {
            logger.debug('luster: unlink socket %s', socket);
            fs.unlinkSync(socket);
        } catch (e) {
            logger.error('Can\'t unlink socket %s', socket);
        }
    }

    util.makeCache()
        .then(function() {
            config.get('app:update:enable') && updater.init(luster).start(luster);
        })
        .fail(function() {
            logger.error('Can not create cache folder and it subfolders');
        });
}

try {
    luster.configure({
        app: require.resolve('./worker'),
        workers: config.get('app:luster:workers'),
        control: config.get('app:luster:control'),
        server: config.get('app:luster:server')
    }, true, __dirname);
}catch(err) {
    logger.error('Error luster initialization');
}

module.exports = luster;
