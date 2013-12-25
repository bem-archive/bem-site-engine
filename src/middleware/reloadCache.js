module.exports = function(router) {
    return function(req, res, next) {
        var route = router.findFirst(req._parsedUrl.path);

        if (route) {
            var name = route[0].getName();
            if(name === '__reload') {
                process.send('reload');

                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end('Invalidate cache and reload data will be executed immediately\n');

            }else {
                process.send('request');
                return next();
            }
        } else {
            return next(new HttpError(HttpError.CODES.NOT_FOUND));
        }
    };
};
