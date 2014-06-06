var config = require('./config');

exports.isDev = function() {
    return 'development' === config.get('NODE_ENV');
};
