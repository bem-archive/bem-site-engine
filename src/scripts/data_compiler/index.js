var _ = require('lodash'),
    config = require('./lib/config'),
    logger = require('./lib/logger')(module),
    snapshot = require('./snapshot');

var ENV = {
        DEVELOPMENT: 'development',
        TESTING: 'testing',
        PRODUCTION: 'production'
    },
    VERSION = {
        LATEST: 'latest',
        PREVIOUS: 'previous'
    },
    MSG = {
        INFO: {
            START: '-- data compiler module start --',
            END: '-- data compiler successfully finished --'
        },
        ERROR: 'Error occur while compile models and loading documentation'
    };

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath) {
        logger.info(''.toUpperCase.apply(MSG.INFO.START));

        var environment = config.get('NODE_ENV') || ENV.DEVELOPMENT,
            version = process.argv[3] || VERSION.LATEST;

        logger.debug('enviroment: %s', environment);

        if(!_.isNumber(version) && !_.isString(version)) {
            logger.warn('Invalid version format. Will be settled latest data version')
            version = 0;
        }

        if(VERSION.LATEST === version) {
            logger.debug('Latest version of data will be settled');
            version = 0;
        }

        if(VERSION.PREVIOUS === version) {
            logger.debug('Previous version of data will be settled');
            version = -1;
        }

        if(_.isString(version)) {
            logger.debug('Version %s of data will be settled', version);
        }

        switch (environment) {
            case ENV.TESTING:
                return compileForTesting(modelPath, version);
            case ENV.PRODUCTION:
                return compileForProduction(modelPath, version);
            default:
                return compileForDevelopment(modelPath, version);
        }
    }
};

var compileForDevelopment = function(modelPath, version) {
    logger.debug('start compile data for development environment');
    return snapshot.run(modelPath);
};

var compileForTesting = function(modelPath, version) {
    logger.debug('start compile data for testing environment');
};

var compileForProduction = function(modelPath, version) {
    logger.debug('start compile data for production environment');
};