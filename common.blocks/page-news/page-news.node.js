modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'news',
    rule : '/{lang}/news',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
