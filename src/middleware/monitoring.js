var config = require('../config');

/**
 * Middleware for handling monitoring requests
 * @returns {Function}
 */
module.exports = function() {

    var monitoring = config.get('app:monitoring') || '/monitoring';

    return function(req, res, next) {
        if(req.url.indexOf(monitoring) == -1) {
            return next();
        }

        res.writeHead(200, { 'Content-Type' : 'text/plain' });
        res.end('Pong');
    };
};
