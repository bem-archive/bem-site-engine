modules.define('yana-view', function(provide, View) {

provide(View.decl('page', {

    createContext : function() {
        return this.__base();
    }

}));

});
