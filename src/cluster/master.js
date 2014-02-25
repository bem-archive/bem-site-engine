var fs = require('fs'),
    master = require('luster'),
    logger = require('../logger')(module),
    config = require('../config'),
    socket = config.get('app:socket');

if (master.isMaster) {
    logger.debug('luster: master process start');

    var socket = config.get('app:socket');

    if (socket) {
        try {
            logger.debug('luster: unlink socket');
            fs.unlinkSync(socket);
        } catch (e) {}
    }

    logger.verbose('luster: register remote command reload');
    master.registerRemoteCommand('reload', function(sender, value) {
        logger.info('master receive message reload from sender %s with value %s', sender.wid, value);
    });

    logger.debug('luster: register remote command request');
    master.registerRemoteCommand('request', function(sender, value) {
        logger.verbose('master receive message request from sender %s with value %s', sender.wid, value);
    });

    logger.debug('luster: master process started');
}

module.exports = master;
