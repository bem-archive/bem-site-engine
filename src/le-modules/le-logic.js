var u = require('util'),
    _ = require('lodash'),
    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,
    leData = require('./le-data'),
    leApp = require('./le-app');

module.exports = {

    /**
     * Returns node by request
     * @param req - {Object} http request object
     * @returns {Object} founded node
     */
    getNodeByRequest: function(req) {
        logger.debug('get node by request %s', req._parsedUrl.pathname);

        var result,
            url = req._parsedUrl.pathname,
            nodeR = function(node) {

                if(node.url === url) {
                    if(node.hidden[req.prefLocale]) {
                        throw HttpError.createError(404);
                    }
                    result = node;
                    return result;
                }

                //deep into node items
                if(!result && node.items) {
                    node.items.some(function(item) {
                        return nodeR(item);
                    });
                }
            };

        //if not index page then remove possible multiple trailing slashes
        if(url !== '/') {
            url = url.replace(/(\/)+$/, '');
        }

        leApp.getSitemap().some(function(item) {
            return nodeR(item);
        });

        if(result) {
            logger.debug('find node %s %s', result.id, result.source);
            return result;
        }else {
            logger.error('cannot find node by url %s', req._parsedUrl.pathname);
            throw HttpError.createError(404);
        }
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

        if(node.title) {
            title = node.title[req.prefLocale];
        }

        var nodeR = function(node) {
            if(node.route && node.route.pattern) {
                return '/' + node.title[req.prefLocale];
            }
            return node.parent ? nodeR(node.parent) : '';
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

        if(node.source) {
            source = leData.getData()[node.id][req.prefLocale];

            if(source) {
                meta['description'] = meta['ogDescription'] = source.summary;
                meta['keywords'] = meta['ogKeywords'] = source.tags ? source.tags.join(', ') : '';

                if(source['ogImage'] && source['ogImage'].length > 0) {
                    meta['image'] = source['ogImage'];
                }else if(source['thumbnail'] && source['thumbnail'].length > 0) {
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
                if(_node.parent && _node.parent.id) {
                    nodeRP(_node.parent);
                }
            },
            nodeRC = function(_node) {
                result[_node.level] = result[_node.level] || [];

                //if node is not hidden for current selected locale
                //then we should draw it corresponded menu item
                if(!_node.hidden[req.prefLocale]) {
                    result[_node.level].push({
                        title: _node.title ? _node.title[req.prefLocale]: '',
                        url: _node.url,
                        active: _.indexOf(activeIds, _node.id) !== -1,
                        type: _node.type,
                        size: _node.size
                    });
                }

                var hasSource = _node.source,
                    hasItems = _node.items,
                    isTargetNode = _node.id === node.id,
                    isActive = activeIds.indexOf(_node.id) !== -1,
                    isGroup = _node.type === 'group',

                    isNeedToDrawChildNodes = isGroup || isActive && (!isTargetNode || (isTargetNode && hasItems && hasSource));

                if(isNeedToDrawChildNodes) {
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
                if(node.route.pattern) {
                    result[node.route.name] = {
                        title: node.title[lang]
                    }
                }

                if(node.source) {
                    result[node.route.name].items = result[node.route.name].items || [];
                    result[node.route.name].items.push(_.pick(node, 'id', 'url'));
                }

                if(node.items) {
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
                return item.items && item.items.length > 0;
            });
        }

        /*
            Filter all resources by lang, and filter criteria
            of field <-> value equality with all possible accepted
            types of field and values
        */
        var validIdSet = _.keys(leData.getData()).filter(function(id) {
            var data = leData.getData()[id][lang];

            if(!data) {
                return false;
            }

            if(_.isArray(field) && _.isArray(value)) {
                return field.filter(function(f) {
                    if(_.isArray(data[f])) {
                        return _.intersection(data[f], value).length > 0;
                    }else {
                        return value.indexOf(data[f]) !== -1;
                    }
                }).length > 0;
            } else if(_.isArray(field)) {
                return field.filter(function(f) {
                    if(_.isArray(data[f])) {
                        return data[f].indexOf(value) !== -1;
                    }else {
                        return data[f] === value;
                    }
                }).length > 0;
            } else if(_.isArray(value)) {
                if(_.isArray(data[field])) {
                    return _.intersection(data[field], value).length > 0;
                }else {
                    return value.indexOf(data[field]) !== -1;
                }
            } else {
                if(_.isArray(data[field])) {
                    return data[field].indexOf(value) !== -1;
                }else {
                    return data[field] === value;
                }
            }

        });

        logger.silly('validIdSet: %s', validIdSet.join(', '));

        //filter pseudo-nodes by validIdSet criteria
        result = _.values(result)
            .filter(function(item) {
                return item.items;
            })
            .map(function(item) {
                item.items = item.items.filter(function(_item) {
                    return validIdSet.indexOf(_item.id) !== -1;
                });

                return item;
            })
            .filter(function(item) {
                return item.items.length > 0;
            });

        return result;
    },

    /**
     * Returns url for lang-switch block link
     * @param req - {Object} http request object
     * @param node - {Object} node from sitemap model
     * @returns {String} compiled url
     */
    getLangSwitchUrlByNode: function(req, node) {
        var currentLang = req.prefLocale,
            targetLang = {
                en: 'ru',
                ru: 'en'
            }[currentLang],
            host = req.headers.host.replace(u.format('%s.', currentLang), ''),
            url = u.format('http://%s.%s', targetLang, host);

        url += node.hidden[targetLang] ? '/' : req._parsedUrl.pathname;

        return url;
    }
};
