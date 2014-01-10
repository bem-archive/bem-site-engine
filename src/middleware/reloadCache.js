var HttpError = require('../errors').HttpError,
    RC_RELOAD = 'reload',
    RC_REQUEST = 'request';

module.exports = function(router, worker) {
    return function(req, res, next) {
        var route = router.findFirst(req._parsedUrl.path);

        if (route) {
            var name = route[0].getName();
            if(name === '__reload') {
                if(worker && worker.remoteCall) {
                    worker.remoteCall(RC_RELOAD);
                }

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Invalidate cache and reload data will be executed immediately\n');

            }else {
                if(worker && worker.remoteCall) {
                    worker.remoteCall(RC_REQUEST);
                }

                return next();
            }
        } else {
            return next(new HttpError(HttpError.CODES.NOT_FOUND));
        }
    };
};
