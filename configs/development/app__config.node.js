(function(app) {

var OS = require('os'),
    PATH = require('path'),
    socketPath = PATH.join(OS.tmpDir(), ['varankinv-', PATH.basename(app.app_root), '-www.sock'].join('')),
    hosts = {
        blackbox : {
            host : 'http://blackbox.yandex-team.ru',
            domain : 'yandex-team.ru'
        },

        passport : {
            host : 'http://passport.yandex-team.ru',
        },

        center : {
            host : 'http://center.yandex-team.ru'
        }
    },
    node = {
        debug : true,
        app : {
            socket : socketPath,
            workers : 2
        }
    };

modules.define('yana-config', ['yana-util'], function(provide, util, config) {

provide(util.extend(
    config,
    app,
    hosts,
    node
));

});

}(require(require('path').resolve(__dirname, '../../configs/common.js'))));