var vow = require('vow'),
    _ = require('lodash'),

    util = require('../lib/util'),
    logger = require('../lib/logger')(module),

    getSitemap = require('./get_sitemap').run,
    analyzeSitemap = require('./analyze_sitemap').run,
    generateSitemap = require('./generate_sitemap').run,
    loadSources = require('./load_sources').run,
    loadLibraries = require('./load_libraries').run,
    loadPeople = require('./load_people').run,
    addDynamicNodes = require('./add_dynamic_nodes').run,
    addLibraryNodes = require('./add_library_nodes').run,
    saveAndUpload = require('./save_and_upload').run;

var MSG = {
    INFO: {
        START: 'create snapshot start',
        END: 'snapshot was created successfully'
    },
    ERROR: 'Error occur while compile models and loading documentation'
};

module.exports = {

    /**
     * Start point for data compiler module
     * @param modelPath - {String} relative path to model index file
     */
    run: function(modelPath) {
        logger.info(MSG.INFO.START);

        return getSitemap(modelPath)
            .then(analyzeSitemap)
            .then(function(obj) {
                return vow.all([
                    obj,
                    loadSources(obj.sourceNodes, obj.sourceRouteHash),
                    loadLibraries(obj.libraryNodes),
                    loadPeople()
                ]);
            })
            .spread(function(obj, docs, libraries, people) {
                return vow
                    .all([
                        addDynamicNodes(obj.sitemap, obj.routes, docs, people),
                        addLibraryNodes(obj.sitemap, obj.routes, obj.libraryNodes, libraries)
                    ]).spread(function(dynamic, search) {
                        return {
                            sitemapXml: generateSitemap(obj.sitemap),
                            sitemap: util.removeCircularReferences(obj.sitemap),
                            routes: obj.routes,
                            docs: docs,
                            urls: dynamic,
                            people: people,
                            search: search
                        };
                    });
            })
            .then(saveAndUpload)
            .then(
                function() { logger.info(MSG.INFO.END); },
                function(err) {
                    logger.error(MSG.ERROR);
                    logger.error(err);
                }
            );
    }
};


