modules.define('yana-config', function(provide, config) {

var PATH = require('path'),
    appRoot = config.app_root;

config.bundles_root = PATH.join(appRoot, 'test.bundles');
config.bundles_path = PATH.relative(appRoot, config.bundles_path);

provide(config);

});