module.exports = function() {
    return function(err, req, res, next) {
        res.statusCode = err.code || 500;

        if (404 === res.statusCode) {
            res.end('Error 404'); //TODO: require html from error bundle
        } else {
            res.end('Error 500'); //TODO: require html from error bundle
        }
    };
};