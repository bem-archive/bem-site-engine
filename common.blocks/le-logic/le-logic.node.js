/*global modules:false */

modules.define(
    'le-logic', ['inherit', 'objects', 'yana-logger', 'le-jspath'],
    function(provide, inherit, objects, logger, leJspath) {

    provide({

        _logicCache: {},

        getLogicCache: function(key) {
            return this._logicCache[key];
        },

        setLogicCache: function(key, value) {
            this._logicCache[key] = value;
        },

        getMethodology: function(data) {
            var result = this.getLogicCache(data.req.path);

            if(result) return result;

            var type = data.page,
                res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang),
                rootId = leJspath.findRootPostId(type, data.lang);

            result = {
                type: type,
                id: (res && res.id) || rootId,
                category: res && res.category,
                query: {
                    predicate: '.' + data.lang + '{.type === $type}{.id !== $rootId}',
                    substitution: { type: type, rootId: rootId }
                }
            };

            this.setLogicCache(data.req.path, result);

            return result;
        }
    });
});
