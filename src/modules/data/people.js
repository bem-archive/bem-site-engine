var path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    common = require('./common');

var peopleHash = {},
    peopleUrls = {};

var MSG = {
    INFO: {
        START: 'Load all people start',
        END: 'People succssfully loaded'
    },
    ERR: 'Error while loading people occur',
    VERBOSE: 'Load person %s'
};

module.exports = {

    /**
     * Loads people data from configured people repository
     * for all unique names of people blocks
     * @returns {*}
     */
    load: function() {
        logger.info(MSG.INFO.START);

        var peopleRepository = config.get('github:peopleRepository');

        return common
            .loadData(common.PROVIDER_GITHUB_API, { repository: peopleRepository })
            .then(function(result) {
                try {
                    var content = (new Buffer(result.res.content, 'base64')).toString();
                    var people = JSON.parse(content);

                    peopleHash = Object.keys(people).reduce(function(prev, key) {
                        logger.verbose(MSG.VERBOSE, key);

                        prev[key] = people[key];
                        return prev;
                    }, {})

                    logger.info(MSG.INFO.END);
                }catch(err) {
                    logger.error(MSG.ERR);
                }
            });
    },

    getPeople: function() {
        return peopleHash;
    },

    getUrls: function() {
        return peopleUrls;
    }
};
