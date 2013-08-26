modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'page-noop',
    rule : '/.*',
    data : {
        action : 'noop'
    }
});

router.addRoute({
    name : 'page-index',
    rule : '/',
    data : {
        action : 'page'
    }
});

View.decl('noop', {

    _loadTemplate : function() {
        return
    },

    render : function() {
        return '';
    }

});

provide(View);

});
