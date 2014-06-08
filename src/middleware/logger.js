var logger = require('../logger')(module);

/**
 * Middleware for logging requests
 * @returns {Function}
 */
module.exports = function() {
    return function(req, res, next) {
        logger.info('request method: %s url: %s locale: %s', req.method, decodeURIComponent(req.url), req.lang);
        return next();
    };
};
