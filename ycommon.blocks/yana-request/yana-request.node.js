/* jshint node:true */
/* global modules:false */

modules.define('yana-request', ['inherit'], function(provide, inherit, Request) {

provide(inherit(Request, {

    __constructor : function() {
        return this.__base.apply(this, arguments)
            .then(function(req) {
                var headers = req.headers;

                req.userip = headers['x-real-ip'] ||
                    headers['x-forwarded-for'] || req.connection.remoteAddress;

                return req;
            });
    }

}));

});