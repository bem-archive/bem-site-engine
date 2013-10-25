modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'page',
    rule : '/page/jobs',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'page',
    rule : '/page/acknowledgement',
    data : {
        action : 'le-page'
    }
});

provide(View);

});


