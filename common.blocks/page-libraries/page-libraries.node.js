modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'libs',
    rule : '/libs',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libs',
    rule : '/libs/{lib}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libs',
    rule : '/libs/{lib}/{version}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libs',
    rule : '/libs/{lib}/{version}/{category}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'libs',
    rule : '/libs/{lib}/{version}/{category}/{id}',
    data : {
        action : 'le-page'
    }
});

provide(View);

});

