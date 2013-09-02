modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'post',
    rule : '/{lang}/{article}/{id}',
    data : {
        action : 'le-page'
    }
});

provide(View);

});
