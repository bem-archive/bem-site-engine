modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({ rule : '/libs/{id}/blocks/{block}', action : 'page' });

provide(View);

});
