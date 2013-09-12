modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'news',
    rule : '/news',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
