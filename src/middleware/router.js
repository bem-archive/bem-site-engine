var HttpError = require('../errors').HttpError,
    logger = require('../logger')(module);

module.exports = function(router) {
    return function(req, res, next) {
        logger.debug('middleware execute for url %s', req._parsedUrl.path);

        var route = router.findFirst(req._parsedUrl.path);

        if (route) {
            req.route = route[0].getName();
            req.params = route[1];
        } else {
            return next(new HttpError(HttpError.CODES.NOT_FOUND));
        }

        next();
    };
};