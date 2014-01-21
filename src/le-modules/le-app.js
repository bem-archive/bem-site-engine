var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),
    leData = require('./le-data');

var sitemap;

exports.run = function() {
    logger.info('Init site structure and load data');

    leData.init();

    return load()
        .then(parse)
        .then(process)
        .then(leData.loadAll)
};

var load = function() {
    logger.debug('Load site map');

    return fs
        .read(path.join('configs', 'common', 'sitemap.json'), 'utf-8')
        .fail(
        function(err) {
            logger.error('Site map loading failed with error %s', err.message);
        }
    );
};

var parse = function(data) {
    logger.debug('Parse site map');

    var def = vow.defer();

    try {
        sitemap = JSON.parse(data);
        def.resolve(sitemap);
    } catch(err) {
        logger.error('Site map parsed with error %s', err.message);
        def.reject(err);
    }

    return def.promise();
};

var process = function(sitemap) {
    logger.debug('Process site map');

    var def = vow.defer(),
        idSourceMap = {},
        nodeR = function(node, parent) {

            node.id = sha(JSON.stringify(node));
            node.parent = parent;

            if(_.has(node, 'source')) {
                idSourceMap[node.id] = node.source;
            }

            if(_.has(node, 'url')) {
                //TODO implement url building
            }

            if(_.has(node, 'items')) {
                node.items.forEach(function(item) {
                    nodeR(item, node);
                });
            }
        };

    sitemap.forEach(function(item) {
        nodeR(item, null);
    });

    leData.setIdHash(idSourceMap);
    return def.resolve(sitemap);
};
