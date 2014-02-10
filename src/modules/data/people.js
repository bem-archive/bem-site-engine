var path = require('path'),

    vow = require('vow'),
    _ = require('lodash'),

    logger = require('../../logger')(module),
    config = require('../../config'),

    common = require('./common');

var peopleHash = {},
    peopleUrls = {};

module.exports = {

    /**
     * Loads people data from configured people repository
     * for all unique names of people blocks
     * @returns {*}
     */
    load: function() {
        logger.info('Load all people start');

        var peopleRepository = config.get('github:peopleRepository');

        return common.loadData(peopleRepository, common.PROVIDER_GITHUB_API).then(function(result) {
            var promises = result.res.map(function(people) {
                return vow
                    .allResolved({
                        metaEn: common.loadData(_.extend({}, peopleRepository,
                            { path: path.join(people.path, people.name + '.en.meta.json') }), common.PROVIDER_GITHUB_API),
                        metaRu: common.loadData(_.extend({}, peopleRepository,
                            { path: path.join(people.path, people.name + '.ru.meta.json') }), common.PROVIDER_GITHUB_API)
                    })
                    .then(function(value) {
                        var _def = vow.defer(),
                            getPeopleFromMeta = function(meta) {
                                meta = (new Buffer(meta.res.content, 'base64')).toString();
                                meta = JSON.parse(meta);

                                //TODO can make some post-load operations here
                                return meta;
                            };

                        peopleHash[people.name] = {
                            en: getPeopleFromMeta(value.metaEn._value),
                            ru: getPeopleFromMeta(value.metaRu._value)
                        };

                        _def.resolve(peopleHash[people.name]);
                        return _def.promise();
                    });
            });

            return vow.allResolved(promises);
        });
    },

    getPeople: function() {
        return peopleHash;
    },

    getUrls: function() {
        return peopleUrls;
    }
};
