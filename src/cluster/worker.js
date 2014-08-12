var path =require('path');
    //luster = require('luster');


    console.log('start worker process');
    require(path.join(process.cwd(), 'src', 'bundles', 'desktop.bundles', 'common', 'common.node.js'));

