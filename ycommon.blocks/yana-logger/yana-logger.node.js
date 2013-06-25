modules.define('yana-logger', ['yana-config'], function(provide, config) {

var log4node = require('log4node'),
    cfg = config.logger,
    log = new log4node.Log4Node({
        prefix : cfg.prefix,
        level : cfg.level,
        file  : cfg.file
    });

provide(log);

});