/* jshint node:true */
/* global modules:false */

modules.define(
    'yana-request',
    ['inherit', 'yana-logger', 'yana-config'],
    function(provide, inherit, logger, config, Request) {

provide(inherit(Request, {

    __constructor : function() {
        return this.__base.apply(this, arguments)
            .then(function(req) {
                var headers = req.headers;

                req.userip = headers['x-real-ip'] || req.connection.remoteAddress;

                req.logger = logger;

                req.env = {
                    config : config
                };

                return req;
            });
    }

}));

});