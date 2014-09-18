var _ = require('lodash');

modules.define('middleware__page-menu', ['logger', 'constants', 'model'], function(provide, logger, constants, model) {
    logger = logger(module);

    var getActiveNodeIds = function(node) {
        var activeIds = [];

        /**
         * Recursively finds all id of parent nodes for current
         * @param _node - {RuntimeNode} current node
         */
        var traverse = function(_node) {
            activeIds.push(_node.id);
            if(_node.parent && _node.parent.id) {
                traverse(_node.parent);
            }
        };

        traverse(node);
        return activeIds;
    };

    provide(function() {

        var MenuItem = function(node, lang, activeIds, isTarget) {
            this.title = node.title ? node.title[lang] : '';
            this.url = (node.url && _.isObject(node.url)) ? node.url[lang] : node.url;

            this.active = activeIds.indexOf(node.id) !== -1; //detect if node is in active nodes
            this.type = node.type;
            this.size = node.size;
            this.hasSource = !!node.source; //detect if node has source
            this.hasItems = (node.items && node.items.length); //detect if node has items
            this.isTargetNode = isTarget; // detect if node is target final node
            this.isGroup = node.TYPE.GROUP === node.type; // detect if node is group
            this.isSelect = node.TYPE.SELECT === node.type; //detect if node is select
            this.isIndex = node.VIEW.INDEX === node.view; //detect if node has index view

            //its a terrible condition for detect if we should create or not create the next menu group
            this.isNeedToDrawChildNodes = (this.isGroup || this.isSelect) ||
                this.isIndex || this.active && (!this.isTargetNode || (this.isTargetNode && this.hasItems && this.hasSource));
        };

        return function(req, res, next) {
            var node = req.__data.node,
                activeIds = getActiveNodeIds(node),
                result = [],

                /**
                 * Recursively traversing through nodes tree and creating menu structure
                 * @param _node - {RuntimeNode} current node
                 * @param parent - {RuntimeNode} parent node
                 */
                traverseTreeNodesDown = function(_node, parent) {
                    result[_node.level] = result[_node.level] || {
                        type: constants.MENU.DEFAULT,
                        items: []
                    };

                    //all items with zero level become to be a items of main menu
                    _node.level === 0 &&
                    (result[_node.level].type = constants.MENU.MAIN);

                    //if level node was found then we should mark menu group as level group
                    (_node.class && _node.class === 'level') &&
                    (result[_node.level].type = constants.MENU.LEVEL);

                    //create base menu item object
                    var menuItem = new MenuItem(_node, req.lang, activeIds, _node.id === node.id);

                    //if node is not hidden for current selected locale
                    //then we should draw it corresponded menu item
                    if(!_node.hidden[req.lang]) {
                        if (parent) {
                            parent.items = parent.items || [];
                            parent.items.push(menuItem);
                        }else {
                            result[_node.level].items.push(menuItem);
                        }
                    }

                    if(menuItem.isNeedToDrawChildNodes && _node.items) {
                        _node.items.forEach(function (item) {
                            traverseTreeNodesDown(item, (menuItem.isGroup || menuItem.isSelect) ? menuItem : null);
                        });
                    }
                };

            model.getSitemap().forEach(function(item) {
                traverseTreeNodesDown(item, null);
            });

            req.__data.menu = result;
            return next();
        };
    });
});
