var vow = require('vow'),
    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module);

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath) {
        logger.info('create snapshot start');

        return require('./get_sitemap')(modelPath)
            .then(require('./analyze_sitemap'))
            .then(function(obj) {
                return vow.all([
                    obj,
                    require('./load_sources')(obj.sourceNodes, obj.sourceRouteHash),
                    require('./load_libraries')(obj.libraryNodes),
                    require('./load_people')()
                ]);
            })
            .spread(function(obj, docs, libraries, people) {
                return vow
                    .all([
                        require('./add_dynamic_nodes')(obj.sitemap, obj.routes, docs, people),
                        require('./add_library_nodes')(obj.sitemap, obj.routes, obj.libraryNodes, libraries)
                    ]).spread(function(dynamic, search) {
                        return {
                            sitemapXml: require('./generate_sitemap')(obj.sitemap),
                            sitemap: util.removeCircularReferences(obj.sitemap),
                            routes: obj.routes,
                            docs: docs,
                            urls: dynamic,
                            people: people,
                            search: search
                        };
                    });
            })
            .then(require('./save_and_upload'))
            .then(function() {
                logger.info('snapshot was created successfully');
            })
            .fail(function(err) {
                logger.error('Error occur while compile models and loading documentation');
            });
    }
};


