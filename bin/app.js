var path = require('path'),
    fs = require('fs');

var p = path.join(process.cwd(), 'src/bundles/desktop.bundles/common/common.node.js');
fs.exists(p, function(exists) {
    if(!exists) {
        console.error('Error! Bundle node.js file is not exist yet');
        console.error('You must compile bundles before launch application');
        return;
    }

    require('../src/bundles/desktop.bundles/common/common.node.js');
});
