modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'library',
    rule : '/libs/{lib}',
    data : {
        action : 'page'
    }
});

provide(View);

});
