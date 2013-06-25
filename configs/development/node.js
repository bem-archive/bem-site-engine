var OS = require('os'),
    PATH = require('path'),
    appRoot = PATH.resolve(__dirname, '../../'),
    socketPath = PATH.join(
        OS.tmpDir(), ''.concat('varankinv-', PATH.basename(appRoot), '-www.sock'));

module.exports = {
    debug : true,
    app : {
        //port : 3014,
        socket : socketPath,
        workers : 1
    },
    logger : {
        level : 'debug'
    }
};
