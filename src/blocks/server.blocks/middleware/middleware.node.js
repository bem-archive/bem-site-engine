modules.define('middleware', [
    'middleware__locale', 'middleware__logger', 'middleware__monitoring',
        'middleware__proxy-example', 'middleware__proxy-search', 'middleware__page-title',
        'middleware__page-meta', 'middleware__lang-switcher'],
    function(provide, locale, logger, monitoring, proxyExample, proxySearch, pageTitle, pageMeta, langSwitcher) {

        return provide(function() {
            return [
                locale,
                logger,
                monitoring,
                proxyExample,
                proxySearch,
                pageTitle,
                pageMeta,
                langSwitcher
            ];
        });
    }
);
