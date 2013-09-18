modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'filter',
    rule : '/articles/.*',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'filter',
    rule : '/tools/.*',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'filter',
    rule : '/news/.*',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
