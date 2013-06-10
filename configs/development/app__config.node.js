(function(conf) {

var OS = require('os'),
    PATH = require('path'),

    join = PATH.join,
    socketPath = join(OS.tmpDir(), ['varankinv-', PATH.basename(conf.app_root), '-www.sock'].join('')),

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
            root : join(conf.app_root, 'datasrc'),
            host : '/datasrc'
        }
    },
    node = {
        debug : true,
        app : {
            //port : 3014,
            socket : socketPath,
            workers : 2
        },
        logger : {
            level : 'debug'
        },
        //static_host : '//127.0.0.1:8080/'
    };

modules.define('yana-config', ['yana-util'], function(provide, util, config) {
    provide(util.extend(config, conf, { hosts : hosts }, node));
});

}(require('legoa-conf')));
