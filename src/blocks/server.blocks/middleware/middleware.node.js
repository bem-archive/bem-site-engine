modules.define('middleware', [
    'middleware__locale', 'middleware__logger', 'middleware__monitoring', 'middleware__lang-switcher'],
    function(provide, locale, logger, monitoring, langSwitcher) {

        return provide([
            locale, logger, monitoring
        ]);
    }
);
