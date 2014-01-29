var worker = require('luster'),
    RC_RELOAD = 'reload';

module.exports = function() {
    return function(req, res, next) {
        if (req.route !== '__reload') {
            next();
            return;
        }

        if (worker && worker.isWorker && worker.remoteCall) {
            worker.remoteCall(RC_RELOAD);
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Invalidate cache and reload data will be executed immediately\n');
    };
};
