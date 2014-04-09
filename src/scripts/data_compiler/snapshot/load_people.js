var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    providers = require('../providers');

module.exports = {

    /**
     * Loads people data from github repo
     * @returns {Object} people hash
     */
    run: function() {
        logger.info('Load all people start');

        var peopleHash = {},
            peopleRepository = config.get('github:peopleRepository');

        return providers.getProviderGhApi()
            .load({ repository: peopleRepository })
            .then(
                function(result) {
                    try {
                        var content = (new Buffer(result.res.content, 'base64')).toString();
                        var people = JSON.parse(content);

                        peopleHash = Object.keys(people).reduce(function(prev, key) {
                            prev[key] = people[key];
                            return prev;
                        }, {});

                        logger.info('People successfully loaded');

                        return peopleHash;
                    }catch(err) {
                        logger.error('Error occur while loading people');
                    }
                },
                function(err) {
                    logger.error('Error while loading people %s', err);
                }
            );
    }
};
