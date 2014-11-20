var path = require('path');

modules.define('constants', function(provide) {

    provide({
        ROUTE: {
            NAME: 'name',
            CONDITIONS: 'conditions',
            DEFAULTS: 'defaults',
            DATA: 'data'
        },
        DIRS: {
            CACHE: 'cache',
            BRANCH: 'branch',
            TAG: 'tag'
        },
        MENU: {
            DEFAULT: 'default',
            MAIN: 'main',
            LEVEL: 'level'
        },
        SITEMAP: 'sitemap.xml',
        PAGE_CACHE: path.join(process.cwd(), 'cache', 'page')
    });
});
