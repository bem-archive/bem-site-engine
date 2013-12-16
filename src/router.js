var Susanin = require('susanin'),
    router = Susanin();

router.addRoute({
    name: 'index',
    pattern: '/'
});

router.addRoute({
    name: 'method',
    pattern: '/method(/<id>)(/)'
});

router.addRoute({
    name: 'tools',
    pattern: '/tools(/<category>)(/<sub-category>)(/<id>)(/)'
});

router.addRoute({
    name: 'libs',
    pattern: '/libs(/<lib>)(/<version>)(/<category>)(/<id>)(/)'
});

router.addRoute({
    name: 'articles',
    pattern: '/articles(/<id>)(/)'
});

router.addRoute({
    name: 'news',
    pattern: '/news(/<id>)(/)'
});

router.addRoute({
    name: 'tags',
    pattern: '/tags(/<id>)(/)'
});

router.addRoute({
    name: 'authors',
    pattern: '/authors(/<id>)(/)'
});

router.addRoute({
    name: 'jobs',
    pattern: '/jobs(/)'
});

router.addRoute({
    name: 'acknowledgement',
    pattern: '/acknowledgement(/)'
});

module.exports = router;