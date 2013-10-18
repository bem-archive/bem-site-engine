var OS = require('os'),
    PATH = require('path'),
    appRoot = PATH.resolve(__dirname, '../../'),
    // @type {String} <user>-<app>-www.sock
    socket = [process.env.USER, PATH.basename(appRoot), 'www.sock'].join('-');

module.exports = {
    debug : true,
    app : {
        env : 'development',
        //port : 3014,
        socket : PATH.join('/tmp', socket),
        workers : 1
    },
    logger : {
        level : 'debug'
    }
};
