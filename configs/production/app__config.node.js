(function(app) {

var FS = require('fs'),
    OS = require('os'),

    nworkers = OS.cpus().length - 2,

    hosts = {
        'static' : {
            host : '//st.legoa.coal.dev.yandex.net/legoa/1.0'
        },

        'blackbox' : {
            host : 'http://blackbox.yandex-team.ru',
            domain : 'yandex-team.ru'
        },

        'passport' : {
            host : 'http://passport.yandex-team.ru'
        },

        'center' : {
            host : 'http://center.yandex-team.ru'
        },

        'datasrc' : {
            root : '/var/lib/yandex/legoa',
            host : '/datasrc'
        }
    },
    node = {
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

modules.define('yana-config', ['yana-util'], function(provide, util, config) {
    provide(util.extend(config, app, { hosts : hosts }, node));
});

}(require('legoa-conf')));
