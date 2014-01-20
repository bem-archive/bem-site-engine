var master = require('luster'),
    logger = require('./../logger')(module),
    config = require('./../config'),
    socket = config.get('app:socket');

if (master.isMaster) {
    var socket = config.get('app:socket');

    if (socket) {
        try {
            fs.unlinkSync(socket);
        } catch (e) {}
    }

    master.registerRemoteCommand('reload', function(sender, value) {
        logger.info('master receive message reload from sender %s with value %s', sender.wid, value);
    });

    master.registerRemoteCommand('request', function(sender, value) {
        logger.debug('master receive message request from sender %s with value %s', sender.wid, value);
    });
}

module.exports = master;
