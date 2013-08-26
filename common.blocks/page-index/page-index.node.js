modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'index',
    rule : '/',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
