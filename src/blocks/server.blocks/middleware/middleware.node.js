modules.define('middleware', [
        'middleware__locale',
        'middleware__logger',
        'middleware__proxy-example',
        'middleware__router',
        'middleware__page-title',
        'middleware__page-meta',
        'middleware__page-menu',
        'middleware__lang-switcher',
        'middleware__page'],
    function(provide, locale, logger, proxyExample, router, pageTitle, pageMeta, pageMenu, langSwitcher, page) {

        return provide(function() {
            return [
                locale,
                logger,
                monitoring,
                proxyExample,
                proxySearch,
                router,
                pageTitle,
                pageMeta,
                pageMenu,
                langSwitcher,
                page
            ];
        });
    }
);
