var path =require('path'),
    luster = require('luster');

if(luster.isWorker) {
    console.log('start worker process %s', luster.id);

    require(path.join(process.cwd(), 'src', 'bundles', 'desktop.bundles', 'common', 'common.node.js'));
}
