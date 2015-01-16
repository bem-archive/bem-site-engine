var path = require('path'),
    fs = require('fs');

modules.require(['app'], function (app) {
    var p = '../../../../bundles/desktop.bundles/common/common.node.js';
    fs.exists(path.join(module.filename, p), function (exists) {
        exists && app.init();
    });
});
