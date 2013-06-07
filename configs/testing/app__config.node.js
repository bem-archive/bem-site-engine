(function(app) {

var FS = require('fs'),
    OS = require('os'),
    hosts = {
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

        datasrc : {
            root : '/var/lib/yandex/legoa-datasrc',
            host : '/datasrc'
        }
    },
    node = {
        debug : false,
        app : {
            environment : 'testing',
            socket : '/var/run/yandex/legoa-www.sock',
            workers : OS.cpus().length - 1
        },
        logger : {
            level : 'info',
            transport : FS.createWriteStream('/var/log/yandex/legoa-www/node.log', { flags : 'a' })
        },
        static_host : '//st.legoa.coal.dev.yandex.net/'
    };

modules.define('yana-config', ['yana-util'], function(provide, util, config) {
    provide(util.extend(config, app, { hosts : hosts }, node));
});

}(require(require('path').resolve(__dirname, '../../configs/common.js'))));
