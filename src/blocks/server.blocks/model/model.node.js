var u = require('util'),
    url = require('url'),
    path = require('path'),
    zlib = require('zlib'),

    tar = require('tar'),
    request = require('request'),
    _ = require('lodash'),
    vow = require('vow'),
    vowFs = require('vow-fs');

modules.define('model', ['config', 'logger', 'util', 'database'], function (provide, config, logger, util, db) {
    logger = logger(module);
    
    var menu,
        DB_PATH = {
            DB: path.join(process.cwd(), 'db'),
            BASE: path.join(process.cwd(), 'db', 'leveldb'),
            PROCESS: path.join(process.cwd(), u.format('db/%s', process.pid))
        };

    function loadData () {
        // skip data loading for development environment
        if (util.isDev()) {
            return vow.resolve(DB_PATH.BASE);
        }

        var def = vow.defer(),
            provider = config.get('provider'),
            host,
            port,
            link;

        if (!provider) {
            logger.warn('Provider is not configured for application. Update will be skipped');
            return vow.resolve(DB_PATH.BASE);
        }

        host = provider.host;
        port = provider.port;

        if (!host) {
            logger.warn('Provider host name is not configured for application. Update will be skipped');
            return vow.resolve(DB_PATH.BASE);
        }

        if (!port) {
            logger.warn('Provider port number is not configured for application. Update will be skipped');
            return vow.resolve(DB_PATH.BASE);
        }

        link = url.format({
            protocol: 'http',
            hostname: host,
            port: port,
            pathname: '/data/' + config.get('NODE_ENV')
        });

        request.get(link)
            .pipe(zlib.Gunzip())
            .pipe(tar.Extract({ path:  DB_PATH.PROCESS }))
            .on('error', function (err) {
                logger.error('Error %s occur while downloading database snapshot', err);
                def.reject(err);
            })
            .on('end', function () {
                var extractedPath = path.join(DB_PATH.PROCESS, config.get('NODE_ENV'), 'leveldb');
                logger.debug(u.format('Data has been successfully loaded from url %s and extracted to path',
                    link, extractedPath));
                def.resolve(extractedPath);
            });
        return def.promise();
    }

    function connectToDb(snapshotPath) {
        var runProcessDBPath = path.join(DB_PATH.PROCESS, 'run', 'leveldb');

        return util.removeDir(runProcessDBPath)
            .then(function() {
                logger.debug('create dir %s', runProcessDBPath);
                return vowFs.makeDir(runProcessDBPath);
            })
            .then(function() {
                logger.debug('copy database files from %s to %s', snapshotPath, runProcessDBPath);
                return util.copyDir(snapshotPath, runProcessDBPath);
            })
            .then(function() {
                logger.debug('connect to database in path %s', runProcessDBPath);
                return db.connect(runProcessDBPath);
            });
    }

    function combineResults(nodeRecords, docRecords, lang) {
        var docsMap = docRecords.reduce(function (prev, item) {
                prev[item.key] = item.value;
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
                        title: item.title[lang],
                        items: []
                    };
                    prev[item.route.name ].items.push(item);
                    return prev;
                }, {});

        return _.values(result).filter(function (item) {
            return item.items.length;
        });
    }

    provide({
        /**
         * Loads data model from local filesystem or yandex Disk depending on environment and fills the model
         * @returns {*}
         */
        init: function () {
            return loadData().then(connectToDb);
        },

        /**
         * Reloads model data
         * @returns {*}
         */
        reload: function () {
            menu = null;
            return loadData()
                .then(function(snapshotPath) {
                    return db.disconnect()
                        .then(function() {
                            return snapshotPath;
                        });
                })
                .then(connectToDb);
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
                return db.get(nodeRecordKey);
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
            });
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

        /**
         * Returns all node records from database
         * @returns {*}
         */
        getNodes: function () {
            return db.getByKeyPrefix('nodes:');
        },

        getPeople: function () {
            var prefix = 'people:';
            return db.getByKeyPrefix(prefix).then(function (records) {
                return records.reduce(function (prev, item) {
                    prev[item.key.replace(prefix, '')] = item.value;
                    return prev;
                }, {});
            });
        },

        /**
         * Returns map of urls to people nodes by people keys
         * @returns {*}
         */
        getPeopleUrls: function () {
            return db.getByCriteria(function (record) {
                return record.key.indexOf('nodes:') > -1 && record.value.class === 'person';
            })
            .then(function (records) {
                return records.reduce(function (prev, item) {
                    var value = item.value;
                    prev[value.route.conditions.id] = value.url;
                    return prev;
                }, {});
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

            return this.getNodes().then(function (records) {
                var nodes = records.map(function (item) {
                       return item.value;
                    }),
                    idMap = nodes.reduce(function (prev, item, index) {
                        prev[item.id] = index;
                        return prev;
                    }, {}),
                    tree = [];

                nodes.forEach(function (node) {
                    if (node.parent ) {
                        nodes[idMap[node.parent]].items = nodes[idMap[node.parent]].items || [];
                        nodes[idMap[node.parent]].items.push(node);
                        nodes[idMap[node.parent]].items =
                            nodes[ idMap[ node.parent ] ].items.sort(function (a, b) {
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
                return record.key.split(':')[1];
            });
            return db.getByCriteria(function (record) {
                var k = record.key,
                    v = record.value;
                return k.indexOf('nodes:') > -1 && nodeIds.indexOf(v.id) > -1;
            });
        },

        /**
         * Returns nodes with their sources that satisfied authors or translators criteria
         * @param {String} lang - request locale
         * @param {Object} node - target node
         * @returns {*}
         */
        getNodesByPeopleCriteria: function (lang, node) {
            var value = node.route.conditions.id;
            return db.getByCriteria(function (record) {
                var k = record.key,
                    v = record.value;
                return k.indexOf('docs:') > -1 && k.indexOf(':' + lang) > -1 &&
                    ((v.authors && v.authors.indexOf(value) > -1) ||
                    (v.translators && v.translators.indexOf(value) > -1));
                })
                .then(function (docRecords) {
                    return vow.all([ this.getNodesBySourceRecords(docRecords), docRecords ]);
                }, this)
                .spread(function (nodeRecords, docRecords) {
                    return combineResults(nodeRecords, docRecords, lang);
                }, this);
        },

        /**
         * Returns nodes with their sources that satisfied tags criteria
         * @param {String} lang - request locale
         * @param {Object} node - target node
         * @returns {*}
         */
        getNodesByTagsCriteria: function (lang, node) {
            var value = node.route.conditions.id;
            return db.getByCriteria(function (record) {
                    var k = record.key,
                        v = record.value,
                        criteria = k.indexOf('docs:') > -1 && k.indexOf(':' + lang) > -1 && v.tags;

                    if (value) {
                        criteria = criteria && v.tags.indexOf(value) > -1;
                    }
                    return criteria;
                })
                .then(function (docRecords) {
                    return vow.all([ this.getNodesBySourceRecords(docRecords), docRecords ]);
                }, this)
                .spread(function (nodeRecords, docRecords) {
                    return combineResults(nodeRecords, docRecords, lang);
                }, this);
        },

        getNodesByCriteria: function (criteria, onlyFirst) {
            return db.getByCriteria(function(record) {
                return criteria(record);
            }).then(function (records) {
               return onlyFirst ? records[0] : records;
            });
        },

        putToCache: function (key, value) {
            return db.put(key, value);
        },

        getFromCache: function (key) {
            return db.get(key);
        }
    });
});
