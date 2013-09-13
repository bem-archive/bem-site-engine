modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'authors',
    rule : '/authors',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'authors',
    rule : '/authors/{author}',
    data : {
        action : 'le-page'
    }
});


provide(View);

});

