var logger = require('../logger')(module),
    util = require('../util'),
    nodes = require('../model');

module.exports = function(obj) {
    logger.info('Add dynamic nodes to sitemap start');

    var docs = obj.docs,
        tags = docs.tags,
        urls = {
            people: {},
            tags: {}
        },
        tagsEn =  { key: 'tags:en', data: tags.en, urlHash: urls.tags },
        tagsRu =  { key: 'tags:ru', data: tags.ru, urlHash: urls.tags },
        authors = { key: 'authors', data: docs.authors, urlHash: urls.people, people: obj.people },
        translators = { key: 'translators', data: docs.translators, urlHash: urls.people, people: obj.people };

    [tagsEn, tagsRu, authors, translators].map(function(item) {
        return addDynamicNodesFor(item, obj);
    });

    obj.dynamic = urls;
    return obj;
};

var addDynamicNodesFor = function(config, obj) {
    logger.debug('add dynamic nodes for %s', config.key);

    var key = config.key,
        routes = obj.routes,
        targetNode = util.findNodesByCriteria(obj.sitemap, function() {
            return this.dynamic === key;
        }, true);

    if(!targetNode) {
        logger.warn('target node for %s was not found', key);
        return;
    }

    targetNode.items = targetNode.items || [];

    config.data.forEach(function(item) {
        var node;

        if(['authors', 'translators'].indexOf(key) > -1) {
            node = new nodes.person.PersonNode(targetNode, routes, item, config.people);
        }else if(key.indexOf('tags') > -1) {
            node = new nodes.tag.TagNode(targetNode, routes, item);
        }

        config.urlHash[item] = node.url;
        targetNode.items.push(node);
    });
};
