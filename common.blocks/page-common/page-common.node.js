modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'jobs',
    rule : '/page/jobs',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'acknowledgement',
    rule : '/page/acknowledgement',
    data : {
        action : 'le-page'
    }
});

provide(View);

});


