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
        host : '/www/{{DEBIAN_VERSION}}'
    },
    datasrc : {
        host : '/datasrc',
        root : '/var/lib/yandex/legoa/datasrc'
    }
};
