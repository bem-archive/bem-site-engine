require('../desktop.bundles/common/_common.node.js');

var connect = require('connect'),
    config = require('legoa-conf'),
    router = require('./router'),
    middleware = require('./middleware'),
    template = require('./template'),
    LANGS = ['en', 'ru'],
    DEFAULT_LANG = 'en';

module.export = connect()
    .use(connect.logger('dev'))
    .use(middleware.prefLocale(LANGS, DEFAULT_LANG))
    .use(middleware.router(router))
    .use(function(req, res, next) {
        var hosts = config.hosts,
            ctx = {
                req: req,
                res: res,
                params: req.params,
                page: req.route,
                bundleName: config.common_bundle_name,
                staticUrl: ''.concat(hosts.static.host, config.common_bundle_path),
                yaApiHosts: hosts,
                lang: req.prefLocale
            };

        return template.apply(ctx)
            .then(function(html) {
                res.end(html);
            });
    })
    .use(middleware.error())
    .listen(config.app.port);