modules.define(
    'yana-view',
    ['yana-router'],
    function(provide, router, View) {

router.addRoute({
    name : 'news',
    rule : '/news',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}/{2}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}/{2}/{3}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}/{2}/{3}/{4}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}/{2}/{3}/{4}/{5}',
    data : {
        action : 'le-page'
    }
});

router.addRoute({
    name : 'news',
    rule : '/news/{1}/{2}/{3}/{4}/{5}/{6}',
    data : {
        action : 'le-page'
    }
});


provide(View);

});
