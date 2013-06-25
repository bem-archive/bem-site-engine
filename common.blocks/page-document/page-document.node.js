modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'document',
    rule : '/libs/{lib}/blocks/{block}',
    data : {
        action : 'page'
    }
});

provide(View);

});
