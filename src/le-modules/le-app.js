var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),
    susanin = require('susanin'),

    util = require('../util'),
    logger = require('../logger')(module),
    config = require('../config'),
    leData = require('./le-data');

var ROUTE = {
    NAME: 'name',
    CONDITIONS: 'conditions',
    DEFAULTS: 'defaults',
    DATA: 'data'
},
NODE = {
    VIEW: {
        POST: 'post',
        POSTS: 'posts',
        AUTHOR: 'author',
        TAGS: 'tags'
    },
    TYPE: {
        SIMPLE: 'simple',
        GROUP: 'group'
    },
    SIZE: {
        NORMAL: 'normal'
    }
};

var sitemap,
    peopleUrls = {},
    tagUrls = {},
    routes = {};

module.exports = {
    run: function() {
        logger.info('Init site structure and load data');

        leData.init();

        return load()
            .then(parse)
            .then(process)
            .then(function(nodesWithSource) {
                return vow.all([
                    leData.loadDataForNodes(nodesWithSource),
                    leData.loadPeople()
                ])
            })
            .then(addDynamicNodes);
    },

    /**
     * Returns array of objects for susanin routes creation
     * @returns {Array}
     */
    getRoutes: function() {
        return _.values(routes);
    },

    /**
     * Returns parsed and post-processed sitemap model
     * @returns {Object}
     */
    getSitemap: function() {
        return sitemap;
    },

    getPeopleUrls: function() {
        return peopleUrls;
    }
};

/**
 * Load sitemap file from filesystem
 * @returns {String} - content of sitemap.json file
 */
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

/**
 * Parse content of sitemap json file to js object and handle errors
 * @param data - content of sitemap.json file
 * @returns {Object} parsed sitemap object
 */
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
        nodesWithSource = [],

        /**
         * Creates hash unique id of node -> source
         * @param node {Object} - single node of sitemap model
         */
        processSource = function(node) {
            if(node.source) {
                nodesWithSource.push(node);
            }
        },

        /**
         * Makes title consistent
         * @param node {Object} - single node of sitemap model
         */
        processTitle = function(node) {
            if(node.title && _.isString(node.title)) {
                node.title = {
                    en: node.title,
                    ru: node.title
                }
            }
        },

        /**
         * Select view for node
         * @param node {Object} - single node of sitemap model
         */
        processView = function(node) {
            node.view = node.view || (node.source ? NODE.VIEW.POST : NODE.VIEW.POSTS);
        },

        /**
         * Set hidden state for node
         * @param node {Object} - single node of sitemap model
         */
        processHidden = function(node) {

            //show node for all locales
            if(!node.hidden) {
                node.hidden = {};
                return;
            }

            //hide node for locales that exists in node hidden array
            if(_.isArray(node.hidden)) {
                node.hidden = {
                    en: node.hidden.indexOf('en') !== -1,
                    ru: node.hidden.indexOf('ru') !== -1
                };
                return;
            }

            //hide node for all locales
            if(node.hidden === true) {
                node.hidden = {
                    en: true,
                    ru: true
                };
                return;
            }
        },

        /**
         * Collects routes rules for nodes
         * @param node {Object} - single node of sitemap model
         * @param level {Number} - menu deep level
         */
        processRoute = function(node, level) {
            node.params = _.extend({}, node.parent.params);
            node.level = level;

            if(!node.route) {
                node.route = {
                    name: node.parent.route.name
                };
                node.type = node.type || (node.url ? NODE.TYPE.SIMPLE : NODE.TYPE.GROUP);
                return;
            }

            var r = node.route;

            if(r[ROUTE.NAME]) {
                routes[r.name] = routes[r.name] || { name: r.name, pattern: r.pattern };
                node.url = susanin.Route(routes[r.name]).build(node.params);
            }else {
                r.name = node.parent.route.name;
            }

            [ROUTE.DEFAULTS, ROUTE.CONDITIONS, ROUTE.DATA].forEach(function(item) {
                routes[r.name][item] = routes[r.name][item] || {};

                if(r[item]) {
                    Object.keys(r[item]).forEach(function(key) {
                        if(item === ROUTE.CONDITIONS) {
                            routes[r.name][item][key] = routes[r.name][item][key] || [];
                            routes[r.name][item][key].push(r[item][key]);

                            node.url = susanin.Route(routes[r.name]).build(_.extend(node.params, r[item]));
                        }else {
                            routes[r.name][item][key] = r[item][key];
                        }
                    });
                }
            });

            node.type = node.type || NODE.TYPE.SIMPLE;
        },

        /**
         * Recursive function for traversing tree model
         * @param node {Object} - single node of sitemap model
         * @param parent {Object} - parent for current node
         * @param level {Number} - menu deep level
         */
        traverseTreeNodes = function(node, parent, level) {

            node.id = sha(JSON.stringify(node)); //generate unique id for node as sha sum of node object
            node.parent = parent; //set parent for current node
            node.size = node.size || NODE.SIZE.NORMAL;

            processRoute(node, level);
            processTitle(node);
            processSource(node);
            processHidden(node);
            processView(node);

            logger.silly('id = %s level = %s url = %s source = %s',
                    node.id, node.level, node.url, node.source);

            //deep into node items
            if(node.items) {
                node.items.forEach(function(item) {
                    traverseTreeNodes(item, node, node.type === NODE.TYPE.GROUP ? level : level + 1);
                });
            }
        };

    try {
        sitemap.forEach(function(item) {
            traverseTreeNodes(item, {
                route: {name: null},
                params: {}
            }, 0);
        });

        def.resolve(nodesWithSource);
    } catch(e) {
        logger.error(e.message);
        def.reject(e);
    }

    return def.promise();
};

/**
 * Dynamic addition of nodes for authors, translators and tags
 * grouped menu items
 */
var addDynamicNodes = function() {
    logger.debug('add dynamic nodes');

    var basePeopleConfig = {
        title: function(item){
            var people = leData.getPeople()[item];
            return {
                en: u.format('%s %s', people.en.firstName, people.en.lastName),
                ru: u.format('%s %s', people.ru.firstName, people.ru.lastName)
            };
        },
        view: NODE.VIEW.AUTHOR,
        urlHash: peopleUrls
    };

    addDynamicNodesFor(_.extend({ key: 'authors', data: leData.getAuthors }, basePeopleConfig));
    addDynamicNodesFor(_.extend({ key: 'translators', data: leData.getTranslators }, basePeopleConfig));

    addDynamicNodesFor({
        key: 'tags',
        data: leData.getTags,
        title: function(item) {
            return {
                en: item,
                ru: item
            };
        },
        view: NODE.VIEW.TAGS,
        urlHash: tagUrls
    });
};

var addDynamicNodesFor = function(config) {
    //find node with attribute dynamic and value equal to key
    var targetNode = findNodeByCriteria('dynamic', config.key);

    if(!targetNode) {
        return;
    }

    //find base route (route with pattern) for target node
    var traverseTreeNodes = function(node) {
            if(node.route && node.route.pattern) {
                return node.route;
            }

            if(node.parent) {
                return traverseTreeNodes(node.parent);
            }
        },
        baseRoute = traverseTreeNodes(targetNode);

    //create empty items array if it not exist yet
    if(!targetNode.items) {
        targetNode.items = [];
    }

    routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

    try {
        config.data.apply(null).forEach(function(item) {
            var conditions = {
                conditions: {
                    id: item
                }
            };

            //collect conditions for base route in routes map
            Object.keys(conditions.conditions).forEach(function(key) {
                routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
                routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
            });

            //create node
            var _node = {
                title: config.title.call(null, item),
                route: _.extend({}, { name: baseRoute.name }, conditions),
                url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions),
                level: targetNode.type === NODE.TYPE.GROUP ? targetNode.level : targetNode.level + 1,
                type: NODE.TYPE.SIMPLE,
                size: NODE.SIZE.NORMAL,
                view: config.view,
                hidden: {en: false, ru: false}
            };

            config.urlHash[item] = _node.url;

            //generate unique id for node
            //set target node as parent
            //put node to the items array of target node
            targetNode.items.push(_.extend(_node, {
                id: sha(JSON.stringify(_node)),
                parent: targetNode
            }));
        });
    }catch(e) {
        logger.error(e.message);
    }
};

/**
 * Finds node by attribute and its value
 * @param field - {Stirng} name of attribute
 * @param value - {String} value of attribute
 * @returns {Object} node
 */
var findNodeByCriteria = function(field, value) {

    var result = null,
        traverseTreeNodes = function(node) {
            if(node[field] && node[field] === value) {
                result = node;
            }

            if(!result && node.items) {
                node.items.forEach(function(item) {
                    traverseTreeNodes(item);
                })
            }
        };

    sitemap.forEach(function(node) {
        if(result) {
            return;
        }
        traverseTreeNodes(node);
    });

    return result;
};
