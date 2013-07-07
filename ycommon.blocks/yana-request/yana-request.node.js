/* jshint node:true */
/* global modules:false */

modules.define(
    'yana-request',
    ['yana-logger', 'yana-config'],
    function(provide, logger, config, Request) {

Object.defineProperty(Request, 'userip', {
    get : function() {
        return this.headers['x-real-ip'] || this.connection.remoteAddress;
    }
});

provide(Request);

});