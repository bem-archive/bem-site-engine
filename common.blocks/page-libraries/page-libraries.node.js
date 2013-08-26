modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'libraries',
    rule : '/libs',
    data : {
        action : 'le-page'
    }
});

provide(View);

});