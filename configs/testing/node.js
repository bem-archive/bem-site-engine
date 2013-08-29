var OS = require('os'),

    nworkers = OS.cpus().length - 2;

module.exports = {
    debug : false,
    app : {
        env : 'testing',
        socket : '/tmp/legoa-nodejs.sock',
        workers : nworkers < 1? 1 : nworkers
    },
    logger : {
        level : 'info',
        file : '/var/log/yandex/legoa/nodejs.log'
    }
};
