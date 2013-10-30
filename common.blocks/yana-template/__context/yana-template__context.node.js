modules.define(
    'yana-template__context',
    ['yana-util', 'http-request', 'file-provider', 'le-datasrc', 'le-jspath', 'le-logic'],
    function(provide, util, httpRequest, fileProvider, leDatasrc, leJspath, leLogic, context) {

provide(util.extend(context, {
    httpProvider : httpRequest,
    fileProvider : fileProvider,
    leDatasrc : leDatasrc,
    leJspath : leJspath,
    leLogic : leLogic
}));

});
