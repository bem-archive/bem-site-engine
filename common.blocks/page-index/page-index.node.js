modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({ rule : '/', action : 'page' });

provide(View);

});
