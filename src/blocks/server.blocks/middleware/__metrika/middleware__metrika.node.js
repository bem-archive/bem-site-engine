modules.define('middleware__metrika', ['config'], function (provide, config) {
    /**
     * Middleware for set Yandex Metrika counter from config
     * @returns {Function}
     */
    provide(function () {
        return function (req, res, next) {
            req.metrika = config.get('metrika');

            return next();
        };
    });
});
