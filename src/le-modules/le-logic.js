var _ = require('lodash'),
    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,
    leData = require('./le-data'),
    leApp = require('./le-app');

module.exports = {

    getNodeByRequest: function(req) {
        logger.debug('get node by request %s', req.url);

        var name = req.route,
            params = req.params,
            result,
            nodeR = function(node, parent) {

                if(_.has(node, 'route') && _.isObject(node.route)) {

                    if(node.route.name !== name) {
                        return;
                    }

                    if(_.has(node.route, 'pattern')) {
                        result = node;
                    }

                    ['conditions'].forEach(function(item) {
                        if(_.has(node.route, item)) {
                            if(_.keys(params).some(function(paramKey) {
                                return _.has(node.route[item], paramKey) &&
                                    params[paramKey] === node.route[item][paramKey];
                            })) {
                                result = node;
                            };
                        }
                    });

                }

                //deep into node items
                if(_.has(node, 'items')) {
                    node.items.forEach(function(item) {
                        nodeR(item, node);
                    });
                }
            };

        try {
            leApp.getSitemap().forEach(function(item) {
                nodeR(item, null);

                if(!_.isUndefined(result)) {
                    return;
                }
            });
        }catch(e) {
            logger.error(e)
        }

        if(!_.isUndefined(result)) {
            logger.debug('find node %s %s', result.id, result.source);
        }else {
            logger.error('cannot find node by url %s', req.url);
        }

        return result;
    },

    /**
     * Returns title for request by request and current node
     * @param req - {Object} http request object
     * @param node - {Object} node from sitemap model
     * @returns {String} page title
     */
    getTitleByNode: function(req, node) {
        logger.debug('get title by request %s and node %s', req.url, node.id);

        var title;

        if(_.has(node, 'title')) {
            title = node.title[req.prefLocale];
        }

        var nodeR = function(node) {
            if(_.has(node, 'route') && _.has(node.route, 'pattern')) {
                return '/' + node.title[req.prefLocale];
            }
            return _.has(node, 'parent') ? nodeR(node.parent) : '';
        };

        title += nodeR(node.parent) + '/BEM';

        logger.debug('page title: %s', title);
        return title;
    },

    /**
     * Retrieves meta-information for request by request and current node
     * @param req - {Object} http request object
     * @param node - {Object} node from sitemap model
     * @returns {Object} object with fields:
     * description - {String} meta-description attribute
     * ogDescription - {String} og:description attribute
     * keywords - {String} keywords for source
     * ogKeywords - {String} keywords for source, og:keywords attribute
     * image - {String}
     * ogType - {String}
     * ogUrl - {String} url of source
     */
    getMetaByNode: function(req, node) {
        logger.debug('get meta by request %s and node %s', req.url, node.id);

        var source,
            meta = {};

        if(_.has(node, 'source')){
            source = leData.getData()[node.id][req.prefLocale];

            if(source) {
                meta['description'] = meta['ogDescription'] = source.summary;
                meta['keywords'] = meta['ogKeywords'] = source.tags ? source.tags.join(', ') : '';

                if(_.has(source, 'ogImage') && source['ogImage'].length > 0) {
                    meta['image'] = source['ogImage'];
                }else if(_.has(source, 'thumbnail') && source['thumbnail'].length > 0) {
                    meta['image'] = source['thumbnail'];
                }

                meta['ogType'] = source.type === 'post' ? 'article': null;
                meta['ogUrl'] = req.url;
            }
        }else{
            meta['description'] = node.title[req.prefLocale];
            meta['ogUrl'] = req.url;
        }

        return meta;
    },

    getMenuByNode: function(req, node) {
        logger.debug('get menu by request %s and node %s', req.url, node.id);

        var result = [],
            activeIds = [],
            nodeRP = function(_node) {
                activeIds.push(_node.id);
                if(_.has(_node, 'parent') && _.has(_node.parent, 'id')) {
                    nodeRP(_node.parent);
                }
            },
            nodeRC = function(_node) {
                result[_node.level] = result[_node.level] || [];

                if(_node.type === 'delimeter') {
                    logger.info('');
                }

                result[_node.level].push({
                    title: _node.title ? _node.title[req.prefLocale]: '',
                    url: _node.url,
                    active: _.indexOf(activeIds, _node.id) !== -1,
                    type: _node.type,
                    size: _node.size
                });

                var isNeedToDraw = _.has(_node, 'items') &&
                    (_node.type === 'group' || (_node.level <= node.level && _.indexOf(activeIds, _node.id) !== -1));

                if(isNeedToDraw) {
                    _node.items.forEach(function(item) {
                        nodeRC(item);
                    });
                }

            };

        nodeRP(node);
        logger.silly('active ids %s', activeIds.join(', '));

        leApp.getSitemap().forEach(function(item) {
            nodeRC(item);
        });

        return result;
    },

    /**
     * Returns array of pseudo-nodes with title attribute
     * and pseudo-node items with id and url attributes which
     * is necessary to build posts block
     * @param lang - {String} lang
     * @param field - {Array|String} array or string with criteria source field
     * @param value - {Array|String} array or string with search value
     * @returns {Array}
     */
    getNodeIdsByCriteria: function(lang, field, value) {
        logger.silly('get node ids by criteria start');

        var result = {},
            nodeR = function(node) {
                if(_.has(node.route, 'pattern')) {
                    result[node.route.name] = {
                        title: node.title[lang]
                    }
                }

                if(_.has(node, 'source')) {
                    result[node.route.name].items = result[node.route.name].items || [];
                    result[node.route.name].items.push(_.pick(node, 'id', 'url'));
                }

                if(_.has(node, 'items')) {
                    node.items.forEach(function(item) {
                        nodeR(item);
                    })
                }
            };

        /*
            Recursive sitemap iteration and creating
            pseudo node representation of site sections
            with corresponded posts
        */
        leApp.getSitemap().forEach(function(node) {
            nodeR(node);
        });

        //if value is not present show all-pseudo nodes
        if(_.isUndefined(value) || _.isNull(value)) {
            return _.values(result).filter(function(item) {
                return _.has(item, 'items') && item.items.length > 0;
            });
        }

        /*
            Filter all resources by lang, and filter criteria
            of field <-> value equality with all possible accepted
            types of field and values
        */
        var validIdSet = _.keys(leData.getData()).filter(function(id) {
            var data = leData.getData()[id][lang];


            if(_.isArray(field) && _.isArray(value)) {
                return field.filter(function(f) {
                    if(_.isArray(data[f])) {
                        return _.intersection(data[f], value).length > 0;
                    }else {
                        return _.indexOf(value, data[f]) !== -1;
                    }
                }).length > 0;
            } else if(_.isArray(field)) {
                return field.filter(function(f) {
                    if(_.isArray(data[f])) {
                        return _.indexOf(data[f], value) !== -1;
                    }else {
                        return data[f] === value;
                    }
                }).length > 0;
            } else if(_.isArray(value)) {
                if(_.isArray(data[field])) {
                    return _.intersection(data[field], value).length > 0;
                }else {
                    return _.indexOf(value, data[field]) !== -1;
                }
            } else {
                if(_.isArray(data[field])) {
                    return _.indexOf(data[field], value) !== -1;
                }else {
                    return data[field] === value;
                }
            }

        });

        logger.silly('validIdSet: %s', validIdSet.join(', '));

        //filter pseudo-nodes by validIdSet criteria
        result = _.values(result)
            .filter(function(item) {
                return _.has(item, 'items');
            })
            .map(function(item) {
                item.items = item.items.filter(function(_item) {
                    return _.indexOf(validIdSet, _item.id) !== -1;
                });

                return item;
            })
            .filter(function(item) {
                return item.items.length > 0;
            });

        return result;
    }
};
