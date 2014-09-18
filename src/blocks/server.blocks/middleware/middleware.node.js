modules.define('middleware', [
        'middleware__locale',
        'middleware__logger',
        'middleware__service',
        'middleware__proxy-example',
        'middleware__slashes',
        'middleware__redirect',
        'middleware__router',
        'middleware__page-title',
        'middleware__page-meta',
        'middleware__page-menu',
        'middleware__lang-switcher',
        'middleware__page',
        'middleware__error'
    ],
    function(provide, locale, logger, service, proxyExample, slashes, redirect, router, pageTitle, pageMeta, pageMenu, langSwitcher, page, error) {

        return provide(function() {
            return [
                locale,
                logger,
                service,
                proxyExample,
                slashes,
                redirect,
                router,
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
