var vow = require('vow'),
    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module);

function getSitemap(modelPath) {
    logger.info('Get sitemap start');

    try {
        return vow.resolve(require(modelPath).get());
    }catch(err) {
        logger.error('Can not resolve valid sitemap js model');
        return vow.reject(err.message);
    }
}

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath) {
        logger.info('create snapshot start');

        return getSitemap(modelPath)
            .then(require('./analyze_sitemap'))
            .then(require('./load_sources'))
            .then(require('./load_people'))
            .then(require('./add_dynamic_nodes'))
            .then(require('./add_library_nodes'))
            .then(require('./generate_sitemap'))
            .then(require('./save_and_upload'))
            .then(function() {
                logger.info('snapshot was created successfully');
                return vow.resolve();
            })
            .fail(function() {
                logger.error('Error occur while compile models and loading documentation');
                return vow.reject();
            });
    }
};


