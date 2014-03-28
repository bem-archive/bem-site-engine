var vow = require('vow'),
    logger = require('../../logger')(module);

var MSG = {
    INFO: {
        START: 'Get sitemap start',
        SUCCESS: 'Sitemap js model has been loaded successfully'
    },
    ERROR: 'Can not resolve valid sitemap js model'
};

module.exports = {
    run: function(modelPath) {
        logger.info(MSG.INFO.START);

        var def = vow.defer();

        try {
            def.resolve(require(modelPath).get());
            logger.info(MSG.INFO.SUCCESS);
        }catch(err) {
            def.reject(err.message);
            logger.error(MSG.ERROR);
        }
        return def.promise();
    }
};