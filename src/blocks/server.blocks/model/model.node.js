var u = require('util'),
    vow = require('vow');

modules.define('model', ['config', 'logger', 'util', 'database'],
        function(provide, config, logger, util, db) {

    logger = logger(module);

    var menu;

    function load() {
        return db.connect();
    }

    provide({
        /**
         * Loads data model from local filesystem or yandex Disk depending on environment and fills the model
         * @returns {*}
         */
        init: function() {
            return load();
        },

        /**
         * Reloads model data
         * @returns {*}
         */
        reload: function() {

        },

        //TODO implement redirects
        getRedirects: function () {
            return [];
        },

        getNodeByUrl: function(url) {
            return db.get(u.format('urls:%s', url)).then(function(nodeRecordKey) {
                if(!nodeRecordKey) {
                    return vow.resolve(null);
                }
                return db.get(nodeRecordKey);
            });
        },

        getNodeItems: function(node) {
            return db.getValuesByCriteria(function(value) {
                return value.parent === node.id;
            });
        },

        getParentNode: function(node) {
            return db.get(u.format('nodes:%s', node.parent));
        },

        getParentNodes: function(node) {
            var _this = this,
                result = [],
                traverse = function(node) {
                    if (!node) {
                        return vow.resolve(result);
                    }

                    result.push(node);
                    return node.parent ?
                        _this.getParentNode(node).then(traverse) : vow.resolve(result);
                };
            return traverse(node);
        },

        getSourceOfNode: function (node, lang) {
            return db.get(u.format('docs:%s:%s', node.id, lang));
        },

        getNodes: function() {
            return db.getByKeyPrefix('nodes:');
        },

        getPeople: function(field) {
            var prefix = 'people:';
            return db.getByKeyPrefix(prefix).then(function(records) {
                return records.reduce(function(prev, item) {
                    prev[item.key.replace(prefix, '')] = field ? item.value[field] : item.value;
                    return prev;
                }, {});
            });
        },

        getBlock: function(key) {
            return db.get(key);
        },

        getAuthors: function() {
            return db.get('authors');
        },

        getMenuTree: function() {
            if(menu) {
                return vow.resolve(menu);
            }

            return this.getNodes().then(function(records) {
                var nodes = records.map(function(item) {
                       return item.value;
                    }),
                    idMap = nodes.reduce(function(prev, item, index) {
                        prev[item.id] = index;
                        return prev;
                    }),
                    tree = [];

                nodes.forEach(function(node) {
                    if(node.parent) {
                        nodes[idMap[node.parent]].items = nodes[idMap[node.parent]].items || [];
                        nodes[idMap[node.parent]].items.push(node);
                        nodes[idMap[node.parent]].items =
                            nodes[idMap[node.parent]].items.sort(function(a, b) {
                            return a.order > b.order;
                        });
                    } else {
                        tree.push(node);
                        tree = tree.sort(function(a, b) {
                            return a.order > b.order;
                        });
                    }
                });
                menu = tree;
                return menu;
            });
        }
    });
});
