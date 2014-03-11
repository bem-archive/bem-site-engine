var logger = require('../logger')(module);

module.exports = function() {
    return function(req, res, next) {
        logger.info('request method: %s url: %s locale: %s', req.method, req.url, req.prefLocale);
        next();
    };
};
