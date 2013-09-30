modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'libraries',
    rule : '/libs',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libraries',
    rule : '/libs/{1}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libraries',
    rule : '/libs/{1}/{2}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libraries',
    rule : '/libs/{1}/{2}/{3}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libraries',
    rule : '/libs/{1}/{2}/{3}/{4}',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

