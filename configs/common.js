var PATH = require('path'),
    UTIL = require('util'),

    APP_ROOT = PATH.resolve(__dirname, '../'),
    BUNDLES_ROOT = PATH.join(APP_ROOT, 'desktop.bundles'),
    BUNDLES_PATH = PATH.relative(APP_ROOT, BUNDLES_ROOT),
    COMMON_BUNDLE_NAME = 'common';

module.exports = {

    app_root : APP_ROOT,

    bundles_root : BUNDLES_ROOT,

    bundles_path : BUNDLES_PATH,

    common_bundle_name : COMMON_BUNDLE_NAME,

    common_bundle_path : UTIL.format('/%s/%s/', BUNDLES_PATH, COMMON_BUNDLE_NAME),

    routes : [
        { rule : '/', action : 'index' },
        { rule : '/libs', action : 'libraries' },
        { rule : '/libs/{id}', action : 'library' },
        { rule : '/libs/{id}/catalogue', action : 'catalogue' },
        { rule : '/libs/{id}/catalogue/{block}', action : 'item' }
    ]

};
