/* jshint node:true */
/* global modules:false */

modules.define(
    'yana-template__context',
    ['yana-logger', 'http-provider', 'file-provider', 'ya-auth', 'le-datasrc', 'vow'],
    function(provide, logger, httpProvider, fileProvider, yaAuth, leDatasrc, Vow) {

provide({
    require : require,
    console : logger,
    httpProvider : httpProvider,
    fileProvider : fileProvider,
    yaAuth : yaAuth,
    leDatasrc : leDatasrc,
    Vow : Vow
});

});