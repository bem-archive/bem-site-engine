var PATH = require('path'),
    appRoot = PATH.resolve(__dirname, '../../');

module.exports = {
    blackbox : {
        host : 'http://blackbox.yandex-team.ru',
        domain : 'yandex-team.ru'
    },
    passport : {
        host : 'http://passport.yandex-team.ru'
    },
    center : {
        host : 'http://center.yandex-team.ru'
    },
    static : {
        host : ''
    },
    datasrc : {
        host : '/datasrc',
        root : '/usr/lib/yandex/bem-info-www/datasrc'
    }
};
