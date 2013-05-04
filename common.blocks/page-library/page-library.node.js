modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({ rule : '/libs/{id}', action : 'page' });

provide(View);

});
