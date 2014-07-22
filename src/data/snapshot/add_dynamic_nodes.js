var _ = require('lodash'),
    susanin = require('susanin'),
    vow = require('vow'),

    logger = require('../lib/logger')(module),
    config = require('../lib/config'),
    util = require('../lib/util'),
    constants = require('../lib/constants'),
    nodes = require('../model');

module.exports = function(obj) {
    logger.info('Add dynamic nodes to sitemap start');

    var urls = {
        people: {},
        tags: {}
    },
    tagsEn =  { key: 'tags:en', data: obj.docs.tags.en, urlHash: urls.tags },
    tagsRu =  { key: 'tags:ru', data: obj.docs.tags.ru, urlHash: urls.tags },
    authors = { key: 'authors', data: obj.docs.authors, urlHash: urls.people, people: obj.people },
    translators = { key: 'translators', data: obj.docs.translators, urlHash: urls.people, people: obj.people };

    [tagsEn, tagsRu, authors, translators].map(function(item) {
        return addDynamicNodesFor(item, obj);
    });

    obj.dynamic = urls;
    return obj;
};

var addDynamicNodesFor = function(config, obj) {
    logger.debug('add dynamic nodes for %s', config.key);

    var routes = obj.routes,
        targetNode = util.findNodesByCriteria(obj.sitemap, function() {
        return this.dynamic === config.key;
    }, true);

    if(!targetNode) {
        logger.warn('target node for %s was not found', config.key);
        return;
    }

    targetNode.items = targetNode.items || [];

    config.data.forEach(function(item) {
        var node;

        if(['authors', 'translators'].indexOf(config.key) > -1) {
            node = new nodes.person.PersonNode(targetNode, routes, item, config.people);
        }else if(config.key.indexOf('tags') > -1) {
            node = new nodes.tag.TagNode(targetNode, routes, item);
        }

        config.urlHash[item] = node.url;
        targetNode.items.push(node);
    });
};
