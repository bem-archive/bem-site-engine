(function(app) {

var OS = require('os'),
    PATH = require('path'),
    FS = require('fs'),

    join = PATH.join,
    logStream = FS.createWriteStream(
        '/var/log/yandex/legoa-www/nodejs.log', { flags : 'a' }),

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
            root : join(app.app_root, 'datasrc'),
            host : '/datasrc'
        }
    },
    node = {
        debug : false,
        app : {
            environment : 'production',
            socket : '/var/run/yandex/legoa-www.sock',
            workers : OS.cpus().length - 1
        },
        logger : {
            level : 'debug',
            transport : logStream
        }
    };

modules.define('yana-config', ['yana-util'], function(provide, util, config) {
    provide(util.extend(config, app, { hosts : hosts }, node));
});

}(require(require('path').resolve(__dirname, '../../configs/common.js'))));
