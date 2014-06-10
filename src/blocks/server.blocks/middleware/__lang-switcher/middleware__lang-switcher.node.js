var u = require('util');

modules.define('middleware__lang-switcher', function(provide) {

    provide(function() {
        return function(req, res, next) {
            var node = req.__data.node,
                lang = {
                    en: 'ru',
                    ru: 'en'
                }[req.lang],
                host = req.headers.host.replace(u.format('%s.', req.lang), ''),
                url = u.format('//%s.%s%s', lang, host, node.hidden[lang] ? '/' : req.path);

            req.__data.langSwitch = url;
            return next();
        };
    });
});
