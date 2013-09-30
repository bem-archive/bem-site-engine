modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'method',
    rule : '/method',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'method',
    rule : '/method/{1}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'method',
    rule : '/method/{1}/{2}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'method',
    rule : '/method/{1}/{2}/{3}',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

