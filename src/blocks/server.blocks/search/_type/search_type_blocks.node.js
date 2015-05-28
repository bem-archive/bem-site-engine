var vow = require('vow'),
    _ = require('lodash');

modules.define('search_type_blocks', ['logger', 'model'], function (provide, logger, model) {

    logger = logger(module);

    function getDescription(item, lang) {
        return model.getBlock(item.description)
            .then(function (data) {
                var description;

                if (!data) {
                    item.description = '';
                    return item;
                }

                data = data[lang] || data;
                description = data.description;

                if (_.isArray(description)) {
                    description = description[0].content;
                }
                item.description = description;
                return item;
            })
            .fail(function (err) {
                logger.warn('Search getDescription fail', err);
            });
    }

    provide({
        convert: function (result) {
            return result.reduce(function (prev, item) {
                var route = item.route,
                    conditions = route.conditions,
                    library = conditions.lib,
                    version = conditions.version,
                    level = conditions.level,
                    block = conditions.block,
                    uniqName = block + '-' + library,
                    existed = prev[uniqName] || {
                            block: block,
                            lib: library,
                            title: item.title,
                            description: item.source.data, // getDescription(item, lang),
                            versions: {},
                            class: 'block'
                        };

                existed.versions[version] = existed.versions[version] || [];
                existed.versions[version].push({
                    level: level,
                    url: item.url
                });

                prev[uniqName] = existed;

                return prev;
            }, {});
        },

        search: function (text, lang) {
            // var startTime = +(new Date());
            return model
                .getNodesByCriteria(function (record) {
                    var v = record.value;
                    return v.class === 'block' && v.title && v.title[lang].indexOf(text) > -1;
                }, false)
                .then(function (records) {
                    // console.log('SEARCH BLOCKS TIME: %s', (+(new Date() - startTime)));
                    var results = _.values(this.convert(records.map(function (record) {
                        return record.value;
                    }), lang));

                    return vow.all(results.map(function (item) {
                        return getDescription(item, lang);
                    }));
                }, this)
                .then(function (results) {
                    /*
                        Filter empty results.
                        Partial fix https://st.yandex-team.ru/BEMINFO-1095
                    */
                    results = results.filter(function (item) {
                        return item;
                    });

                    return _.sortBy(results, function (result) {
                        return result.block;
                    });
                });
        }
    });
});
