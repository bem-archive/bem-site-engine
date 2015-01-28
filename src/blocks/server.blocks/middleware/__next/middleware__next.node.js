modules.define('middleware__next', function (provide) {
    provide(function () {
        return function (req, res, next) {
            return next();
        };
    });
});
