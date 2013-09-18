modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'page',
    rule : '/{type}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'page',
    rule : '/{type}/.*',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

