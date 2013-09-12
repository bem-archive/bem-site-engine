modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'articles',
    rule : '/articles',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

