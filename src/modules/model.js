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
    data = require('./data');

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
        TAGS: 'tags',
        BLOCK: 'block'
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
    routes = {};


module.exports = {
    init: function() {
        logger.info('Init site structure and load data');

        data.common.init();

        return load()
            .then(parse)
            .then(process)
            .then(function(res) {
                return vow.all([
                    data.docs.load(res.docs),
                    data.libraries.load(res.libs),
                    data.people.load()
                ]).then(function() {
                    return res;
                })
            })
            .then(function(res) {
                return vow.all([
                    addLibraryNodes(res.libs),
                    addDynamicNodes()
                ])
            })
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
        nodesWithLib = [],

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

            if(node.lib) {
                nodesWithLib.push(node);
            }

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

        def.resolve({
            docs: nodesWithSource,
            libs: nodesWithLib
        });
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
            var people = data.people.getPeople()[item];
            return {
                en: u.format('%s %s', people.en.firstName, people.en.lastName),
                ru: u.format('%s %s', people.ru.firstName, people.ru.lastName)
            };
        },
        view: NODE.VIEW.AUTHOR,
        urlHash: data.people.getUrls()
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

    addDynamicNodesFor(_.extend({ key: 'authors', data: data.docs.getAuthors }, basePeopleConfig));
    addDynamicNodesFor(_.extend({ key: 'translators', data: data.docs.getTranslators }, basePeopleConfig));

    addDynamicNodesFor({
        key: 'tags',
        data: data.docs.getTags,
        title: function(item) {
            return {
                en: item,
                ru: item
            };
        },
        view: NODE.VIEW.TAGS,
        urlHash: data.docs.getTagUrls()
    });
};

var addLibraryNodes = function(nodesWithLib) {
    logger.debug('add library nodes');

    if(!nodesWithLib || !_.isArray(nodesWithLib) || nodesWithLib.length === 0) {
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

        getBaseNode = function(targetNode, baseRoute, conditions) {
            return {
                route: _.extend({}, { name: baseRoute.name }, conditions),
                url: susanin.Route(routes[baseRoute.name]).build(conditions.conditions),
                level: targetNode.type === NODE.TYPE.GROUP ? targetNode.level : targetNode.level + 1,
                type: NODE.TYPE.SIMPLE,
                size: NODE.SIZE.NORMAL,
                view: NODE.VIEW.POST,
                hidden: {}
            };
        },

        //collect conditions for base route in routes map
        collectConditionsForBaseRoute = function(baseRoute, conditions) {
            Object.keys(conditions.conditions).forEach(function(key) {
                routes[baseRoute.name].conditions[key] = routes[baseRoute.name].conditions[key] || [];
                routes[baseRoute.name].conditions[key].push(conditions.conditions[key]);
            });
        },

        addVersionsToLibrary = function(targetNode) {
            logger.silly('add versions to library');

            var baseRoute = traverseTreeNodes(targetNode);
            routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

            targetNode.items = targetNode.items || [];

            var versions = data.libraries.getLibraries()[targetNode.lib];

            if(!versions) return;

            Object.keys(versions).forEach(function(key) {

                var version = versions[key];
                    conditions = {
                        conditions: {
                            lib: version.repo,
                            version: version.ref
                        }
                    };

                collectConditionsForBaseRoute(baseRoute, conditions)

                //create node
                var _node = _.extend({
                    title: {
                        en: version.ref,
                        ru: version.ref
                    },
                    source: {
                        en: { content: version.readme },
                        ru: { content: version.readme }
                    }
                }, getBaseNode(targetNode, baseRoute, conditions));

                targetNode.items.push(_.extend(_node, {
                    id: sha(JSON.stringify(_node)),
                    parent: targetNode
                }));

                addPostToVersion(_node, version, {
                    key: 'migration',
                    title: {
                        en: 'Migration',
                        ru: 'Migration'
                    }
                });
                addPostToVersion(_node, version, {
                    key: 'changelog',
                    title: {
                        en: 'Changelog',
                        ru: 'Changelog'
                    }
                });
                addLevelsToVersion(_node, version);
            });
        },

        addPostToVersion = function(targetNode, version, config) {
            logger.silly('add post to version');

            var baseRoute = traverseTreeNodes(targetNode);
            routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

            targetNode.items = targetNode.items || [];

            var conditions = {
                conditions: {
                    lib: version.repo,
                    version: version.ref,
                    id: config.key
                }
            };

            collectConditionsForBaseRoute(baseRoute, conditions);

            //create node
            var _node = _.extend({
                title: config.title,
                source: {
                    en: {
                        title: config.title.en,
                        content: version[config.key]
                    },
                    ru: {
                        title: config.title.ru,
                        content: version[config.key]
                    }
                }
            }, getBaseNode(targetNode, baseRoute, conditions));

            targetNode.items.push(_.extend(_node, {
                id: sha(JSON.stringify(_node)),
                parent: targetNode
            }));
        },

        addLevelsToVersion = function(targetNode, version) {
            logger.silly('add levels to version');

            targetNode.items = targetNode.items || [];

            var levels = version.levels;

            if(!levels) return;

            levels.forEach(function(level) {
                //create node
                var _node = {
                    title: {
                        en: level.name,
                        ru: level.name
                    },
                    level: targetNode.type === NODE.TYPE.GROUP ? targetNode.level : targetNode.level + 1,
                    type: NODE.TYPE.GROUP,
                    size: NODE.SIZE.NORMAL,
                    hidden: {}
                };

                targetNode.items.push(_.extend(_node, {
                    id: sha(JSON.stringify(_node)),
                    parent: targetNode
                }));

                addBlocksToLevel(_node, version, level);
            });
        },

        addBlocksToLevel = function(targetNode, version, level) {
            logger.silly('add blocks to level');

            var baseRoute = traverseTreeNodes(targetNode);
            routes[baseRoute.name].conditions = routes[baseRoute.name].conditions || {};

            targetNode.items = targetNode.items || [];

            var blocks = level.blocks;

            if(!blocks) return;

            blocks.forEach(function(block) {
                var conditions = {
                    conditions: {
                        lib: version.repo,
                        version: version.ref,
                        id: block.name
                    }
                };

                collectConditionsForBaseRoute(baseRoute, conditions)

                //create node
                var _node = _.extend({
                    title: {
                        en: block.name,
                        ru: block.name
                    },
                    source: {
                        data: block.data,
                        jsdoc: block.jsdoc
                    }
                }, getBaseNode(targetNode, baseRoute, conditions), { view: NODE.VIEW.BLOCK });

                targetNode.items.push(_.extend(_node, {
                    id: sha(JSON.stringify(_node)),
                    parent: targetNode
                }));
            });
        };

    nodesWithLib.forEach(function(node) {
        addVersionsToLibrary(node);
    });

    logger.debug('end');
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
