var logger = require('../logger')(module),
    config = require('../config');

/**
 * Middleware for handling monitoring requests
 * @returns {Function}
 */
module.exports = function() {

    var REQ = config.get('monitoringUrl') || '/monitoring';

    return function(req, res, next) {
        if(req._parsedUrl.path.substring(0, REQ.length) !== REQ) {
            return next();
        }

        logger.info('Monitoring request has been received');

        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end('Pong');
    };
};