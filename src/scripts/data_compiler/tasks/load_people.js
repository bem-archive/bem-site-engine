var u = require('util'),
    _ = require('lodash'),
    vow = require('vow'),

    logger = require('./../lib/logger')(module),
    config = require('../../../config'),
    data = require('../../../modules/data/index'),
    common = data.common;

var MSG = {
    INFO: {
        START: 'Load all people start',
        SUCCESS: 'People successfully loaded'
    },
    ERROR: 'Error occur while loading people'
};


module.exports = {

    /**
     * Loads people data from github repo
     * @returns {Object} people hash
     */
    run: function() {
        logger.info(MSG.INFO.START);

        var peopleHash = {},
            peopleRepository = config.get('github:peopleRepository');

        return common
            .loadData(common.PROVIDER_GITHUB_API, { repository: peopleRepository })
            .then(function(result) {
                try {
                    var content = (new Buffer(result.res.content, 'base64')).toString();
                    var people = JSON.parse(content);

                    peopleHash = Object.keys(people).reduce(function(prev, key) {
                        prev[key] = people[key];
                        return prev;
                    }, {});

                    logger.info(MSG.INFO.SUCCESS);

                    return peopleHash;
                }catch(err) {
                    logger.error(MSG.ERR);
                }
            });
    }
};
