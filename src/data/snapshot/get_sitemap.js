var vow = require('vow'),
    logger = require('../lib/logger')(module);

module.exports = function(modelPath) {
    logger.info('Get sitemap start');

    var def = vow.defer();

    try {
        def.resolve(require(modelPath).get());
        logger.info('Sitemap js model has been loaded successfully');
    }catch(err) {
        def.reject(err.message);
        logger.error('Can not resolve valid sitemap js model');
    }
    return def.promise();
};
