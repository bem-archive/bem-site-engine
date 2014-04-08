var vow = require('vow'),
    _ = require('lodash'),

    logger = require('./lib/logger')(module),
    data = require('../../modules/data'),
    common = data.common,

    getSitemap = require('./tasks/get_sitemap').run,
    analyzeSitemap = require('./tasks/analyze_sitemap').run,
    loadSources = require('./tasks/load_sources').run,
    loadLibraries = require('./tasks/load_libraries').run,
    loadPeople = require('./tasks/load_people').run,
    addDynamicNodes = require('./tasks/add_dynamic_nodes').run,
    addLibraryNodes = require('./tasks/add_library_nodes').run,
    saveAndUpload = require('./tasks/save_and_upload').run;

var MSG = {
    INFO: {
        START: '-- sitemap_compiler module start --',
        END: '-- sitemap_compiler successfully finished --'
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

        vow
            .when(data.common.init())
            .then(function() {
                return getSitemap(modelPath);
            })
            .then(function(sitemap) {
                return analyzeSitemap(sitemap);
            })
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
                    ]).spread(function(dynamic, libraries) {
                        return {
                            sitemap: removeCircularReferences(obj.sitemap),
                            routes: obj.routes,
                            docs: docs,
                            urls: dynamic,
                            people: people
                        };
                    });
            })
            .then(function(content) {
                return saveAndUpload(content);
            })
            .then(
                function() { logger.info(MSG.INFO.END); },
                function() { logger.error(MSG.ERROR); }
            );
    }
};

/**
 * Remove circular references for parent nodes
 * for get ability to save sitemap object to json file
 * @param tree - {Object} sitemap object with removed circular references
 * @returns {Object}
 */
var removeCircularReferences = function(tree) {
    var traverseTreeNodes = function(node) {
        if(node.parent) {
            node.parent = node.parent.id;
        }

        if(node.items) {
            node.items = node.items.map(function(item) {
                return traverseTreeNodes(item);
            });
        }

        return node;
    };

    return tree.map(function(item) {
        return traverseTreeNodes(item);
    });
};
