/* jshint node:true */
/* global modules:false */

modules.define(
    'yana-template__context',
    ['yana-logger', 'http-request', 'file-provider', 'ya-auth', 'le-datasrc', 'vow'],
    function(provide, logger, httpRequest, fileProvider, yaAuth, leDatasrc, Vow) {

provide({
    require : require,
    console : logger,
    httpProvider : httpRequest,
    fileProvider : fileProvider,
    yaAuth : yaAuth,
    leDatasrc : leDatasrc,
    Vow : Vow
});

});