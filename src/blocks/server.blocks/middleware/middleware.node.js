modules.define('middleware', [
        'middleware__locale',
        'middleware__logger',
        'middleware__service',
        'middleware__proxy-example',
        'middleware__search',
        'middleware__slashes',
        'middleware__redirect',
        'middleware__router',
        'middleware__html-cache',
        'middleware__next',
        'middleware__page-title',
        'middleware__page-meta',
        'middleware__page-menu',
        'middleware__lang-switcher',
        'middleware__page',
        'middleware__error',
        'config'
    ],
    function (provide, locale, logger, service, proxyExample, search, slashes, redirect, router,
             htmlCache, next, pageTitle, pageMeta, pageMenu, langSwitcher, page, error, config) {

        return provide(function () {
            return [
                locale,
                logger,
                service,
                proxyExample,
                search,
                slashes,
                redirect,
                router,
                config.get('NODE_ENV') !== 'development' ? htmlCache : next,
                pageTitle,
                pageMeta,
                pageMenu,
                langSwitcher,
                page,
                error
            ];
        });
    }
);
