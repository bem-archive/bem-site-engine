var OS = require('os'),

    nworkers = OS.cpus().length - 2;

module.exports = {
    debug : false,
    app : {
        env : 'production',
        socket : '/var/run/yandex/bem-info-www/bem-info-www.sock',
        workers : nworkers < 1? 1 : nworkers
    },
    logger : {
        level : 'info',
        file : '/var/log/yandex/bem-info-www/nodejs.log'
    }
};
