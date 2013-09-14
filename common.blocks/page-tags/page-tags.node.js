modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'tags',
    rule : '/tags',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'tags',
    rule : '/tags/{tags}',
    data : {
        action : 'le-page'
    }
});


provide(View);

});
