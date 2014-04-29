var u = require('util'),
    _ = require('lodash'),

    logger = require('../logger')(module),
    HttpError = require('../errors').HttpError,

    constants = require('./constants'),
    config = require('../config'),
    router = require('./router'),
    model = require('./model');

module.exports = {

    /**
     * Returns node by request
     * @param req - {Object} http request object
     * @returns {RuntimeNode} founded node
     */
    getNodeByRequest: function(req) {
        return router.run(req);
    },

    /**
     * Returns title for request by request and current node
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
     * @returns {String} page title
     */
    getTitleByNode: function(req, node) {
        logger.debug('get title by request %s and node %s', req.url, node.id);

        var title = '';

        if(req.url === '/') {
            return node.title[req.prefLocale];
        }

        var traverseTreeNodes = function(node) {
            if((node.url && node.url !== '/') && (node.title && node.title[req.prefLocale])) {
                title += node.title[req.prefLocale] + ' / ';
                logger.verbose('title: %s', title);
            }
            if(node.parent) {
                traverseTreeNodes(node.parent);
            }
        };

        traverseTreeNodes(node);

        title += config.get('title')[req.prefLocale];

        logger.debug('page title: %s', title);
        return title;
    },

    /**
     * Retrieves meta-information for request by request and current node
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
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

        if(!node.source) {
            meta.description = node.title[req.prefLocale];
            meta.ogUrl = req.url;

            return meta;
        }

        source = node.source[req.prefLocale];

        if(source) {
            meta.description = meta.ogDescription = source.summary;
            meta.keywords = meta.ogKeywords = source.tags ? source.tags.join(', ') : '';

            if(source.ogImage && source.ogImage.length > 0) {
                meta.image = source.ogImage;
            }else if(source.thumbnail && source.thumbnail.length > 0) {
                meta.image = source.thumbnail;
            }

            meta.ogType = source.type === 'post' ? 'article': null;
            meta.ogUrl = req.url;
        }
    },

    /**
     * Creates menu structure for current request and node
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
     * @returns {Array} array of menu groups
     */
    getMenuByNode: function(req, node) {
        logger.debug('get menu by request %s and node %s', req.url, node.id);

        var result = [],
            activeIds = [],

            /**
             * Recursively finds all id of parent nodes for current
             * @param _node - {RuntimeNode} current node
             */
            traverseTreeNodesUp = function(_node) {
                activeIds.push(_node.id);
                if(_node.parent && _node.parent.id) {
                    traverseTreeNodesUp(_node.parent);
                }
            },

            /**
             * Recursively traversing through nodes tree and creating menu structure
             * @param _node - {RuntimeNode} current node
             * @param parent - {RuntimeNode} parent node
             */
            traverseTreeNodesDown = function(_node, parent) {
                result[_node.level] = result[_node.level] ||
                    {
                        type: constants.MENU.DEFAULT,
                        items: []
                    };

                //all items with zero level become to be a items of main menu
                if(_node.level === 0) {
                    result[_node.level].type = constants.MENU.MAIN;
                }

                //if level node was found then we should mark menu group as level group
                if(_node.class && _node.class === 'level') {
                    result[_node.level].type = constants.MENU.LEVEL;
                }

                logger.verbose('menu creation item level %s title %s type %s', _node.level, _node.title ? _node.title[req.prefLocale] : '', _node.type);

                //create base menu item object
                var o = {
                        title: _node.title ? _node.title[req.prefLocale] : '',
                        url: (_node.url && _.isObject(_node.url)) ? _node.url[req.prefLocale] : _node.url,
                        active: _.indexOf(activeIds, _node.id) !== -1,
                        type: _node.type,
                        size: _node.size
                    },
                    hasSource = !!_node.source, //detect if node has source
                    hasItems = _node.items, //detect if node has items
                    isTargetNode = _node.id === node.id, // detect if node is target final node
                    isActive = activeIds.indexOf(_node.id) !== -1, //detect if node is in active nodes
                    isGroup = _node.type === _node.TYPE.GROUP, // detect if node is group
                    isSelect = _node.type === _node.TYPE.SELECT, //detect if node is select
                    isIndex = _node.view && _node.view === _node.VIEW.INDEX, //detect if node has index view


                    //its a terrible condition for detect if we should create or not create the next menu group
                    isNeedToDrawChildNodes = (isGroup || isSelect) || isIndex || isActive && (!isTargetNode || (isTargetNode && hasItems && hasSource));

                //logger.verbose('isTargetNode %s isActive %s isGroup %s isSelect %s isIndex %s isNeedToDrawChildNodes %s title %s',
                //    isTargetNode, isActive, isGroup, isSelect, isIndex, isNeedToDrawChildNodes, _node.title ? _node.title[req.prefLocale] : 'NAN');

                //if node is not hidden for current selected locale
                //then we should draw it corresponded menu item
                if(!_node.hidden[req.prefLocale]) {
                    if (parent) {
                        parent.items = parent.items || [];
                        parent.items.push(o);
                    }else {
                        result[_node.level].items.push(o);
                    }
                }

                if(isNeedToDrawChildNodes) {

                    _node.items && _node.items.forEach(function(item) {
                        traverseTreeNodesDown(item, (isGroup || isSelect) ? o : null);
                    });
                }

            };

        traverseTreeNodesUp(node);
        //logger.verbose('active ids %s', activeIds.join(', '));

        model.getSitemap().forEach(function(item) {
            traverseTreeNodesDown(item, null);
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
    getNodesBySourceCriteria: function(lang, field, value) {
        logger.debug('get nodes by criteria start %s %s %s', lang, field, value);

        var result = {},
            traverseTreeNodes = function(node) {
                if(node.route.pattern) {
                    result[node.route.name] = {
                        title: node.title[lang]
                    };
                }

                if(node.source && node.view !== node.VIEW.TAGS) {
                    result[node.route.name].items = result[node.route.name].items || [];

                    if(sourceOfNodeSatisfyCriteria(node.source[lang], field, value)) {
                        result[node.route.name].items.push(node);
                    }
                }

                if(node.items) {
                    node.items.forEach(function(item) {
                        traverseTreeNodes(item);
                    });
                }
            };

        model.getSitemap().forEach(function(node) {
            traverseTreeNodes(node);
        });

        return _.values(result).filter(function(item) {
            return item.items && item.items.length > 0;
        });
    },

    /**
     * Returns url for lang-switch block link
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
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
    },

    /**
     * Loads advanced data for nodes with exotic views
     * @param req - {Object} http request object
     * @param node - {RuntimeNode} node from sitemap model
     * @returns {*}
     */
    getAdvancedData: function(req, node) {
        var  result = {
            people: model.getPeople(),
            peopleUrls: model.getPeopleUrls()
        };

        if(node.view === node.VIEW.AUTHOR) {
            return _.extend(result, {
                posts: this.getNodesBySourceCriteria(req.prefLocale, ['authors', 'translators'], req.params.id) });
        }

        if(node.view === node.VIEW.TAGS) {
            return _.extend(result, {
                posts: this.getNodesBySourceCriteria(req.prefLocale, ['tags'], req.params.id) });
        }

        if(node.view === node.VIEW.AUTHORS) {
            return _.extend(result, {
                authors: model.getAuthors() });
        }

        return result;
    }
};

/**
 * Returns true if value of field of data is equal to value
 * @param data - {Object} data  object
 * @param field - {Array || String} name of field or array of fields
 * @param value - {Array || String} value or array of values
 * @returns {boolean} - Boolean result
 */
var sourceOfNodeSatisfyCriteria = function(data, field, value) {
    if(!data) {
        return false;
    }

    if(_.isUndefined(value) || _.isNull(value)) {
        return true;
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
};
