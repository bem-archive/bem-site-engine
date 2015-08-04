modules.define('middleware__response-headers', function (provide) {
    provide(function () {
        return function (req, res, next) {
            res.header({
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN'
            });
            return next();
        }
    });
});
