var worker = require('luster');

module.exports = function(router) {
    return function(req, res, next) {
        var route = router.findFirst(req._parsedUrl.path);

        if (route) {
            var name = route[0].getName();
            if(name === '__reload') {
                worker.remoteCall('reload');

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Invalidate cache and reload data will be executed immediately\n');

            }else {
                worker.remoteCall('request');
                return next();
            }
        } else {
            return next(new HttpError(HttpError.CODES.NOT_FOUND));
        }
    };
};
