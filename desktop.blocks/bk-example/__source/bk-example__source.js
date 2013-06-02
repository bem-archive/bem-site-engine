modules.define(
    'i-bem__dom',
    //['http-provider'],
    function(provide, /*httpProvider,*/ DOM) {

DOM.decl('bk-example', {

    onSetMod : {
        js : {
            inited : function() {
                // TODO
            }
        }
    }

});

provide(DOM);

});
