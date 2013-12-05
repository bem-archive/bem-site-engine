require('./desktop.bundles/common/_common.node.js');

var connect = require('connect'),
    config = require('./config'),
    router = require('./router'),
    middleware = require('./middleware'),
    template = require('./template'),
    datasrc = require('../datasrc/data.json'),
    leJsPath = require('./le-jspath'),
    leLogic = require('./le-logic'),
    statics = new (require('../lib/Statics').Statics)(config.get('statics')),
    bundles = new (require('../lib/Bundles').Bundles)({ defaultLOD: 'desktop' }),
    BUNDLE_NAME = 'common';

module.export = connect()
    .use(connect.logger(config.get('app:logger:mode')))
    .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
    .use(middleware.router(router))
    .use(connect.query())
    .use(function(req, res) {
        var ctx = {
                data: {
                    req: req,
                    bundleName: BUNDLE_NAME,
                    datasrc: datasrc
                },
                modules: {
                    bundles: bundles,
                    statics: statics,
                    leJspath: leJsPath,
                    leLogic: leLogic
                }
            };

        return template.apply(ctx, req.query['__mode'])
            .then(function(html) {
                res.end(html);
            });
    })
    .use(middleware.error())
    .listen(config.get('app:port'));
