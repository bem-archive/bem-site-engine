modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'libraries',
    rule : '/libraries',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libraries',
    rule : '/libraries/.*',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

