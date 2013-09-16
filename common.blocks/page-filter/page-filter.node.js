modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'filter',
    rule : '/{type}/.*',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
