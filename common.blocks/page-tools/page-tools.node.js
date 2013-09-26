modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'tools',
    rule : '/tools',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'tools',
    rule : '/tools/{1}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'tools',
    rule : '/tools/{1}/{2}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'tools',
    rule : '/tools/{1}/{2}/{3}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'tools',
    rule : '/tools/{1}/{2}/{3}/{4}',
    data : {
        action : 'le-page'
    }
});


provide(View);

});
