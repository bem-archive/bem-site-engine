modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'jobs',
    rule : '/jobs',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'acknowledgement',
    rule : '/acknowledgement',
    data : {
        action : 'le-page'
    }
});

provide(View);

});


