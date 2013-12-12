module.exports = {
    debug : false,
    app : {
        env : 'production',
        socket : '/var/run/yandex/bem-info-www/bem-info-www.sock',
        workers : 4
    },
    logger : {
        level : 'info',
        file : '/var/log/yandex/bem-info-www/nodejs.log'
    }
};
