modules.define(
    'yana-template__context',
    ['yana-util', 'http-request', 'file-provider', 'le-datasrc', 'le-jspath'],
    function(provide, util, httpRequest, fileProvider, leDatasrc, leJspath, context) {

provide(util.extend(context, {
    httpProvider : httpRequest,
    fileProvider : fileProvider,
    leDatasrc : leDatasrc,
    leJspath : leJspath
}));

});
