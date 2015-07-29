modules.define('middleware', [
        'middleware__locale',
        'middleware__logger',
        'middleware__service',
        'middleware__proxy-example',
        'middleware__search',
        'middleware__slashes',
        'middleware__response-headers',
        'middleware__redirect',
        'middleware__router',
        'middleware__html-cache',
        'middleware__page-title',
        'middleware__page-meta',
        'middleware__page-menu',
        'middleware__lang-switcher',
        'middleware__page',
        'middleware__error',
        'middleware__gravatar'
    ],
    function (provide, locale, logger, service, proxyExample, search, slashes, responseHeaders, redirect, router,
             htmlCache, pageTitle, pageMeta, pageMenu, langSwitcher, gravatar, page, error) {
        return provide(function () {
            return [
                locale,
                logger,
                service,
                proxyExample,
                search,
                slashes,
                responseHeaders,
                redirect,
                router,
                htmlCache,
                pageTitle,
                pageMeta,
                pageMenu,
                langSwitcher,
                gravatar,
                page,
                error
            ];
        });
    }
);
