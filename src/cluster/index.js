var path = require('path'),
    fs = require('fs'),

    vow = require('vow'),
    vowFs = require('vow-fs'),
    luster = require('luster'),

    updater = require('./updater'),
    config = require('./config');

function unlinkSocket() {
    var socket = config.get('app:luster:server:port');

    if (socket) {
        try {
            fs.unlinkSync(socket);
        } catch (e) {
            console.error('Can\'t unlink socket %s', socket);
        }
    }
}

if (luster.isMaster) {
    console.info('luster: master process start');

    unlinkSocket();

    vow
        .all([
            vowFs.makeDir(path.join('cache', 'branch')),
            vowFs.makeDir(path.join('cache', 'tag'))
        ])
        .then(function() {
            if(config.get('app:update:enable')) {
                updater.init(luster).start(luster);
            }
        })
        .fail(function() {
            console.error('Can not create cache folder and it subfolders');
        });
}

try {
    var workerPath = path.join(process.cwd(), 'src', 'bundles',
        'desktop.bundles', 'common', 'common.node.js');

    luster.configure({
        app: workerPath,
        workers: config.get('app:luster:workers'),
        control: config.get('app:luster:control'),
        server: config.get('app:luster:server')
    }, true);
}catch(err) {
    console.error('Error luster initialization');
}
