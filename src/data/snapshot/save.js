var path = require('path'),
    u = require('util'),

    vow = require('vow'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    util = require('../lib/util'),
    providers = require('../providers');

/**
 * Returns name of snapshot as formatted current date
 * @returns {String}
 */
function getSnapshotName() {
    var date = new Date();

    return u.format('snapshot_%s:%s:%s-%s:%s:%s',
        date.getDate(),
        date.getMonth() + 1,
        date.getFullYear(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    );
}

/**
 * Returns provider which should be used for save and upload
 * data model. It may be file provider or Yandex Disk provider
 * depending on settled environment
 * @returns {*|FileProvider}
 */
function getProvider() {
    return 'development' === config.get('NODE_ENV') ?
        providers.getProviderFile() : providers.getProviderYaDisk();
}

function getConfig() {
    var def = {
            dir: 'backups',
            data: 'data.json',
            blocks: 'blocks.json',
            marker: 'marker.json',
            search: {
                libraries: 'search_libraries.json',
                blocks: 'search_blocks.json'
            }
        },
        model =  config.get('common:model') || def;

    return {
        dir: model.dir || def.dir,
        data: model.data || def.data,
        marker: model.marker || def.marker,
        search: model.search || def.search
    };
}

/**
 * Returns target for saving main part of data model
 * @param content
 * @returns {{path: *, data: *}}
 */
function getTargetData(content) {
    return {
        path: getConfig().data,
        data: JSON.stringify(content)
    };
}

/**
 * Returns target for saving sitemap.xml file
 * @param content
 * @returns {{path: *, data: *}}
 */
function getTargetSitemap(content) {
    return {
        path: 'sitemap.xml',
        data: content.sitemapXml
    };
}

/**
 * Returns target for saving data for libraries search
 * @param content
 * @returns {{path: *, data: *}}
 */
function getTargetSearchLibraries(content) {
    return {
        path: getConfig().search.libraries,
        data: JSON.stringify(content.search.libraries, null, 4)
    };
}

/**
 * Returns target for saving data for blocks search
 * @param content
 * @returns {{path: *, data: *}}
 */
function getTargetSearchBlocks(content) {
    return {
        path: getConfig().search.blocks,
        data: JSON.stringify(content.search.blocks, null, 4)
    };
}

/**
 * Returns target for saving marker file
 * @param content
 * @param snapshot - {String} name of snapshot
 * @returns {{path: *, data: *}}
 */
function getTargetMarker(content, snapshot) {
    return {
        path: getConfig().marker,
        data: JSON.stringify({
            data: sha(JSON.stringify(content)),
            date: snapshot
        })
    };
}

function prepareToSave(content) {
    return {
        sitemap: util.removeCircularReferences(content.sitemap),
        routes: content.routes,
        docs:   content.docs,
        urls:   content.dynamic,
        people: content.people,
        blocks: content.blocksHash
    };
}

module.exports = function(obj) {

    var snapshot = getSnapshotName(),
        data = prepareToSave(obj);

    return getProvider()
        .makeDir({ path: path.join(getConfig().dir, snapshot) })
        .then(function() {
            return vow.all([
                getTargetData(data),
                getTargetSitemap(obj),
                getTargetSearchLibraries(obj),
                getTargetSearchBlocks(obj),
                getTargetMarker(data, snapshot)
            ].map(function(item) {
                return getProvider().save({
                    path: path.join(getConfig().dir, snapshot, item.path),
                    data: item.data
                });
            }));
        });

//    return getProvider()
//        .makeDir({ path: path.join(getConfig().dir, snapshot) })
//        .then(function() {
//            var item = getTargetData(data);
//            return getProvider().save({
//                path: path.join(getConfig().dir, snapshot, item.path),
//                data: item.data
//            });
//        })
//        .then(function() {
//            var item = getTargetSitemap(obj);
//            return getProvider().save({
//                path: path.join(getConfig().dir, snapshot, item.path),
//                data: item.data
//            });
//        })
//        .then(function() {
//            var item = getTargetSearchLibraries(obj);
//            return getProvider().save({
//                path: path.join(getConfig().dir, snapshot, item.path),
//                data: item.data
//            });
//        })
//        .then(function() {
//            var item = getTargetSearchBlocks(obj);
//            return getProvider().save({
//                path: path.join(getConfig().dir, snapshot, item.path),
//                data: item.data
//            });
//        })
//        .then(function() {
//            var item = getTargetMarker(data, snapshot);
//            return getProvider().save({
//                path: path.join(getConfig().dir, snapshot, item.path),
//                data: item.data
//            });
//        });
};
