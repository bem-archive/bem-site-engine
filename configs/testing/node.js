var FS = require('fs'),
    OS = require('os'),

    nworkers = OS.cpus().length - 2,

module.exports = {
    debug : false,
    app : {
        environment : 'production',
        socket : '/var/run/yandex/legoa/nodejs.sock',
        workers : nworkers < 1? 1 : nworkers
    },
    logger : {
        level : 'info',
        transport : FS.createWriteStream('/var/log/yandex/legoa/nodejs.log', { flags : 'a' })
    }
};
