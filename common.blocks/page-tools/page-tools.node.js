modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'tools',
    rule : '/tools',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

