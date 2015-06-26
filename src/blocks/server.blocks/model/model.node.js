var u = require('util'),
    path = require('path'),

    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs');

modules.define('model', ['logger', 'util', 'database', 'luster'],
    function (provide, logger, util, db, luster) {
    logger = logger(module);

    var menu,
        people,
        peopleUrls,
        worker = luster.id || 0,
        DB_PATH = {
            DB: path.join(process.cwd(), 'db'),
            BASE: path.join(process.cwd(), 'db', 'leveldb'),
            WORKER: path.join(process.cwd(), u.format('db/worker_%s', worker))
        },
        initDBForWorker = function () {
            var workerDBPath = path.join(DB_PATH.WORKER, 'leveldb');
            return vowFs.exists(workerDBPath)
                .then(function () {
                    logger.debug('remove dir %s', workerDBPath);
                    return util.removeDir(workerDBPath);
                })
                .then(function () {
                    logger.debug('create dir %s', workerDBPath);
                    return vowFs.makeDir(workerDBPath);
                })
                .then(function () {
                    logger.debug('copy database files from %s to %s', DB_PATH.BASE, workerDBPath);
                    return util.copyDir(DB_PATH.BASE, workerDBPath);
                })
                .then(function () {
                    logger.debug('connect to database in path %s', workerDBPath);
                    return db.connect(workerDBPath);
                });
        };

    provide({

        /**
         * Loads data model from local filesystem or yandex Disk depending on environment and fills the model
         * @returns {*}
         */
        init: function () {
            logger.info('Initialize model for worker %s', worker);
            var _this = this;
            if (luster.isWorker) {
                console.log('send initWorker command from worker %s', worker);
                luster.remoteCall('initWorker', worker);
                luster.registerRemoteCommand('reloadDatabase', function () {
                    logger.info('Worker %s received "reloadDatabase" command', worker);
                    return _this.reload();
                });
            }
            return initDBForWorker();
        },

        /**
         * Reloads model data
         * @returns {*}
         */
        reload: function () {
            menu = null;
            people = null;
            peopleUrls = null;
            return db.disconnect()
                .then(initDBForWorker)
                .then(this.afterReloadDb.bind(this));
        },

        /**
         * Execute custom actions after reloaded the model
         * Used on levels websites like bem-info,
         * for example – build sitemap.xml
         * @returns {*}
         */
        afterReloadDb: function () {
            logger.debug('afterReloadDb');
            return vow.resolve();
        },

        // TODO implement redirects
        getRedirects: function () {
            return [];
        },

        /**
         * Retrieves node by it url
         * @param {String} url - request url
         * @returns {*}
         */
        getNodeByUrl: function (url) {
            return db.get(u.format('urls:%s', url)).then(function (nodeRecordKey) {
                if (!nodeRecordKey) {
                    return vow.resolve(null);
                }
                return db.get(nodeRecordKey).then(function (node) {
                    return node;
                });
            });
        },

        /**
         * Returns items of given node.
         * Get all node records that have given node as their parents
         * @param {Object} node object
         * @returns {*}
         */
        getNodeItems: function (node) {
            return db.getValuesByCriteria(function (value) {
                return value.parent === node.id;
            }, { gte: 'nodes:', lt: 'people', fillCache: true });
        },

        /**
         * Returns parent node record for given node
         * @param {Object} node object
         * @returns {*}
         */
        getParentNode: function (node) {
            return db.get(u.format('nodes:%s', node.parent));
        },

        /**
         * Returns array of all parent nodes of given node
         * @param {Object} node object
         */
        getParentNodes: function (node) {
            var _this = this,
                result = [],
                traverse = function (node) {
                    if (!node) {
                        return vow.resolve(result);
                    }

                    result.push(node);
                    return node.parent ?
                        _this.getParentNode(node).then(traverse) : vow.resolve(result);
                };
            return traverse(node);
        },

        /**
         * Returns doc record corresponded to given node record
         * @param {Object} node object
         * @param {String} lang - request locale
         * @returns {*}
         */
        getSourceOfNode: function (node, lang) {
            return db.get(u.format('docs:%s:%s', node.id, lang));
        },

        getPeople: function () {
            if (people) {
                return vow.resolve(people);
            }

            var prefix = 'people:';
            return db.getByKeyPrefix(prefix, {}).then(function (records) {
                people = records.reduce(function (prev, item) {
                    prev[item.key.replace(prefix, '')] = item.value;
                    return prev;
                }, {});
                return people;
            });
        },

        /**
         * Returns map of urls to people nodes by people keys
         * @returns {*}
         */
        getPeopleUrls: function () {
            if (peopleUrls) {
                return vow.resolve(peopleUrls);
            }

            return db.getByCriteria(function (record) {
                return record.value.class === 'person';
            }, { gte: 'nodes:', lt: 'people', fillCache: true })
            .then(function (records) {
                peopleUrls = records.reduce(function (prev, item) {
                    var value = item.value;
                    prev[value.route.conditions.id] = value.url;
                    return prev;
                }, {});
                return peopleUrls;
            });
        },

        /**
         * Returns block data or jsdoc by its key
         * @param {String} key of block data or jsdoc
         * @returns {*}
         */
        getBlock: function (key) {
            return db.get(key);
        },

        /**
         * Returns array of author records
         * @returns {*}
         */
        getAuthors: function () {
            return db.get('authors');
        },

        /**
         * Returns and cache into memory tree of nodes for
         * suitable menu creation
         * @returns {*}
         */
        getMenuTree: function () {
            if (menu) {
                return vow.resolve(menu);
            }

            return this.getNodesByCriteria(function () {
                    return true;
                }, false)
                .then(function (records) {
                    var nodes = records.map(function (item) {
                           return item.value;
                        }),
                        idMap = nodes.reduce(function (prev, item, index) {
                            prev[item.id] = index;
                            return prev;
                        }, {}),
                        tree = [];

                    nodes.forEach(function (node) {
                        if (node.parent) {
                            nodes[idMap[node.parent]].items = nodes[idMap[node.parent]].items || [];
                            nodes[idMap[node.parent]].items.push(node);
                            nodes[idMap[node.parent]].items =
                                nodes[idMap[node.parent]].items.sort(function (a, b) {
                                    return +a.order - +b.order;
                                });
                        } else {
                            tree.push(node);
                            tree = tree.sort(function (a, b) {
                                return +a.order - +b.order;
                            });
                        }
                    });

                    menu = tree;
                    return menu;
                });
        },

        /**
         * Returns node records corresponded to given doc records
         * @param {Array} docRecords - array of doc records
         * @returns {*}
         */
        getNodesBySourceRecords: function (docRecords) {
            var nodeIds = docRecords.map(function (record) {
                return 'nodes:' + record.key.split(':')[1];
            });
            return this.getNodesByCriteria(function (record) {
                return nodeIds.indexOf(record.key) > -1;
            }, false);
        },

        /**
         * Returns nodes with their sources that satisfied authors or translators criteria
         * @param {String} lang - request locale
         * @param {Object} node - target node
         * @returns {*}
         */
        getNodesByPeopleCriteria: function (lang, node) {
            var value = node.route.conditions.id,
                hint = { gte: 'docs:', lt: 'nodes', fillCache: true };
            return db.getByCriteria(function (record) {
                var k = record.key,
                    v = record.value,
                    criteria = k.indexOf(':' + lang) > -1;

                if (value) {
                    criteria = criteria &&
                    ((v.authors && v.authors.indexOf(value) > -1) ||
                    (v.translators && v.translators.indexOf(value) > -1));
                }
                return criteria;
                }, hint)
                .then(function (docRecords) {
                    return vow.all([this.getNodesBySourceRecords(docRecords), docRecords, this.getSectionNodes()]);
                }, this)
                .spread(function (nodeRecords, docRecords, sectionNodes) {
                    return combineResults(nodeRecords, docRecords, sectionNodes, lang);
                }, this);
        },

        /**
         * Returns nodes with their sources that satisfied tags criteria
         * @param {String} lang - request locale
         * @param {Object} node - target node
         * @returns {*}
         */
        getNodesByTagsCriteria: function (lang, node) {
            var value = node.route ? node.route.conditions.id : node,
                hint = { gte: 'docs:', lt: 'nodes', fillCache: true };
            return db.getByCriteria(function (record) {
                    var k = record.key,
                        v = record.value,
                        criteria = k.indexOf(':' + lang) > -1 && v.tags;

                    if (value) {
                        criteria = criteria && v.tags.indexOf(value) > -1;
                    }
                    return criteria;
                }, hint)
                .then(function (docRecords) {
                    return vow.all([this.getNodesBySourceRecords(docRecords), docRecords, this.getSectionNodes()]);
                }, this)
                .spread(function (nodeRecords, docRecords, sectionNodes) {
                    return combineResults(nodeRecords, docRecords, sectionNodes, lang);
                }, this);
        },

        /**
         * Retrieve nodes by criteria function
         * @param {Function} criteria function
         * @param {Boolean} onlyFirst - if true then only first founded record will be returned
         * @returns {*}
         */
        getNodesByCriteria: function (criteria, onlyFirst) {
            var hint = { gte: 'nodes:', lt: 'people', fillCache: true };
            return db
                .getByCriteria(function (record) {
                    return criteria(record);
                }, hint)
                .then(function (records) {
                   return onlyFirst ? records[0] : records;
                });
        },

        /**
         * Wrapper method for put example files data to cache
         * @param {String} key - database key
         * @param {Object} value - database value
         * @returns {*}
         */
        putToCache: function (key, value) {
            return db.put(key, value);
        },

        /**
         * Wrapper method for retrieving example files from cache
         * @param {String} key - database key
         * @returns {*}
         */
        getFromCache: function (key) {
            return db.get(key);
        },

        getSectionNodes: function () {
            return this.getNodesByCriteria(function (record) {
                return record.value.isCategory;
            }, false);
        }
    });

    function combineResults(nodeRecords, docRecords, sectionNodes, lang) {
        var docsMap = docRecords.reduce(function (prev, item) {
                prev[item.key] = item.value;
                return prev;
            }, {}),
            sectionTitlesMap = sectionNodes.reduce(function (prev, item) {
                var v = item.value;
                prev[v.route.name] = v.title[lang];
                return prev;
            }, {}),
            result = nodeRecords
                .map(function (record) {
                    var v = record.value;
                    v.source = {};
                    v.source[lang] = docsMap[u.format('docs:%s:%s', v.id, lang)];
                    return v;
                })
                .reduce(function (prev, item) {
                    prev[item.route.name] = prev[item.route.name] || {
                        title: sectionTitlesMap[item.route.name],
                        items: []
                    };
                    prev[item.route.name].items.push(item);
                    return prev;
                }, {});

        return _.values(result).filter(function (item) {
            return item.items.length;
        });
    }
});
