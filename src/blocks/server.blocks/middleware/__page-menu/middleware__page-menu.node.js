var _ = require('lodash'),
    vow = require('vow');

modules.define('middleware__page-menu', ['logger', 'constants', 'model'], function (provide, logger, constants, model) {
    logger = logger(module);

    var MenuItem = function (node, lang, activeIds, targetNode) {
            this.init(node, lang, activeIds, targetNode);
        },

        MenuColumn = function (type) {
            this.init(type);
        };

    MenuItem.prototype = {
        title: undefined,
        url: undefined,
        active: undefined,
        type: undefined,
        size: undefined,
        view: undefined,
        hasSource: undefined,
        hasItems: undefined,
        isTargetNode: undefined,
        items: undefined,

        init: function (node, lang, activeIds, targetNode) {
            this.setTitle(node, lang)
                .setUrl(node, lang)
                .setActive(node, activeIds)
                .setFields(node, ['type', 'size', 'hasSource', 'hasItems', 'view'])
                .setIsTarget(node, targetNode);
        },

        setTitle: function (node, lang) {
            this.title = node.title ? node.title[lang] : '';
            // console.log('level %s title %s', node.level, this.title);
            return this;
        },

        setUrl: function (node, lang) {
            this.url = (node.url && _.isObject(node.url)) ? node.url[lang] : node.url;
            return this;
        },

        setActive: function (node, activeIds) {
            this.active = activeIds.indexOf(node.id) > -1;
            return this;
        },

        setFields: function (node, fields) {
            fields.forEach(function (item) {
                this[item] = node[item];
            }, this);
            return this;
        },

        setIsTarget: function (node, targetNode) {
            this.isTargetNode = node.id === targetNode.id;
        },

        isGroup: function () {
            return this.type === 'group';
        },

        isSelect: function () {
            return this.type === 'select';
        },

        isIndex: function () {
            return this.view === 'index';
        },

        isNeedToDrawNext: function () {
            return (this.isGroup() || this.isSelect()) || this.isIndex() ||
                this.active && (!this.isTargetNode || (this.isTargetNode && this.hasItems && this.hasSource));
        },

        addItem: function (item) {
            if (!this.items) {
                this.items = [];
            }
            this.items.push(item);
        },

        getParentForNextItems: function () {
            return (this.isGroup() || this.isSelect()) ? this : null;
        }
    };

    MenuColumn.prototype = {
        type: constants.MENU.DEFAULT,
        items: [],

        init: function (type) {
            this.type = type || constants.MENU.DEFAULT;
            this.items = [];
        },

        setType: function (type) {
            this.type = type;
        },

        addItem: function (item) {
            this.items.push(item);
        }
    };

    provide(function () {
        return function (req, res, next) {
            logger.debug('create menu by request %s', req.url);

            var lang = req.lang,
                node = req.__data.node;

            return vow.all([model.getMenuTree(), model.getParentNodes(node)])
                .spread(function (menuTree, parentNodes) {
                    var menu = [],
                        activeIds = parentNodes.map(function (item) {
                            return item.id;
                        }),

                        /**
                         * Recursively traversing through nodes tree and creating menu structure
                         * @param _node - {RuntimeNode} current node
                         * @param parent - {RuntimeNode} parent node
                         */
                        traverseTreeNodesDown = function (_node, parent) {
                            var level = _node.level;
                            menu[level] = menu[level] || new MenuColumn();

                            // all items with zero level become to be a items of main menu
                            level === 0 && menu[level].setType(constants.MENU.MAIN);

                            // if level node was found then we should mark menu group as level group
                            _node.class === 'level' && menu[level].setType(constants.MENU.LEVEL);

                            // create base menu item object
                            var menuItem = new MenuItem(_node, lang, activeIds, node);

                            // if node is not hidden for current selected locale
                            // then we should draw it corresponded menu item
                            if (!_node.hidden[req.lang]) {
                                parent ? parent.addItem(menuItem) : menu[level].addItem(menuItem);
                            }

                            if (menuItem.isNeedToDrawNext() && _node.items) {
                                _node.items.forEach(function (item) {
                                    traverseTreeNodesDown(item, menuItem.getParentForNextItems());
                                });
                            }
                        };

                    menuTree.forEach(function (item) {
                        traverseTreeNodesDown(item, null);
                    });

                    req.__data.menu = menu;
                    return next();
                });
        };
    });
});
