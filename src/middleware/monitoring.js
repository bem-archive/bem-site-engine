var logger = require('../logger')(module),
    config = require('../config');

module.exports = function() {

    var PATH = config.get('monitoringUrl') || '/monitoring';

    return function(req, res, next) {
        if(req._parsedUrl.path !== PATH) {
            return next();
        }

        logger.info('Monitoring request has been received');
        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end('Pong');
    };
};