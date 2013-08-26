modules.define(
    'yana-template__context',
    ['yana-util', 'http-request', 'file-provider', 'ya-auth', 'le-datasrc'],
    function(provide, util, httpRequest, fileProvider, yaAuth, leDatasrc, context) {

provide(util.extend(context, {
    httpProvider : httpRequest,
    fileProvider : fileProvider,
    yaAuth : yaAuth,
    leDatasrc : leDatasrc
}));

});
