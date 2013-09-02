modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'docs',
    rule : '/{lang}/docs',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

