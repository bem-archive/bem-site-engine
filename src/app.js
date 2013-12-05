require('./desktop.bundles/common/_common.node.js');

var connect = require('connect'),
    config = require('./config'),
    router = require('./router'),
    middleware = require('./middleware');

module.export = connect()
    .use(connect.logger(config.get('app:logger:mode')))
    .use(connect.query())
    .use(middleware.prefLocale(config.get('app:languages'), config.get('app:defaultLanguage')))
    .use(middleware.router(router))
    .use(middleware.page())
    .use(middleware.error())
    .listen(config.get('app:port'));
