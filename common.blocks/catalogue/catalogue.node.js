modules.define(
    'yana-view',
    function(provide, View) {

provide(View.decl('catalogue', {

    createContext : function() {
        return this.__base();
    }

}));

});
