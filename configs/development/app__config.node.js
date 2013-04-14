(function(app) {

var hosts = {
        blackbox : {
            host : 'http://blackbox.yandex-team.ru',
            domain : 'yandex-team.ru'
        },

        passport : {
            host : '//passport.yandex-team.ru',
        },

        center : {
            host : '//center.yandex-team.ru'
        }
    },
    node = {
        port   : 3042,
        socket : '', // TODO
        workers : 2
    };

modules.define('yana:config', ['yana:util'], function(provide, util, config) {

provide(util.extend(config, app, hosts, { debug : true, node : node }));

});

}(require(require('path').resolve(__dirname, '../../configs/common.js'))));