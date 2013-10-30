/*global modules:false */

modules.define(
    'le-logic', ['inherit', 'objects', 'yana-logger', 'le-jspath'],
    function(provide, inherit, objects, logger, leJspath) {

    provide({

        _logicCache: {},

        generateKey: function(data) {
            return data.lang + ':' + data.req.path;
        },

        getLogicCache: function(data) {
            return this._logicCache[this.generateKey(data)];
        },

        setLogicCache: function(data, value) {
            this._logicCache[this.generateKey(data)] = value;
        },

        getMethodology: function(data) {
            var result = this.getLogicCache(data);

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

            this.setLogicCache(data, result);

            return result;
        },

        getArticles: function(data) {
            var result = this.getLogicCache(data);

            if(result) return result;

            var type = data.page,
                res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang);

            result = {
                type: type,
                id: res && res.id,
                category: res && res.category,
                query: {
                    predicate: '.' + data.lang + '{.type === $type}',
                    substitution: { type: type }
                }
            };

            this.setLogicCache(data, result);

            return result;
        },

        getNews: function(data) {
            var result = this.getLogicCache(data);

            if(result) return result;

            var type = data.page,
                res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang);

            result = {
                type: type,
                id: res && res.id,
                category: res && res.category,
                query: {
                    predicate: '.' + data.lang + '{.type === $type}',
                    substitution: { type: type }
                }
            };

            this.setLogicCache(data, result);

            return result;
        },

        getTools: function(data) {
            var result = this.getLogicCache(data);

            if(result) return result;

            var type = data.page,
                res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang),

                id = res && res.id,
                category = res && res.category,
                query = null,
                isOnlyOnePost = false;

            if(category) {
                var predicate = '.' + data.lang + '{.type === $type}' +
                    '{.categories === $category || .categories.url === $category}';

                var rootId = leJspath.findRootPostIdByCategory(type, category, data.lang);
                if(rootId) {
                    predicate +=  '{.id !== "' + rootId + '"}';
                }

                if(!id && rootId){
                    id = rootId;
                }

                query = {
                    predicate: predicate,
                    substitution: { type: type, category: category }
                };

                //проверка на то, что для данного инструмента есть только один пост
                //если это так, то показываем его в развернутом виде а меню постов прячем
                var source = leJspath.find(query.predicate, query.substitution);
                if(source.length == 1) {
                    isOnlyOnePost = true;
                    id = source[0].id;
                }

            }else {
                id = leJspath.findRootPostId(type, data.lang);
                if(!id) {
                    query = {
                        predicate: '.' + data.lang + '{.type === $type}',
                        substitution: { type: type }
                    }
                }
            }

            result = {
                type: type,
                id: id,
                category: category,
                query: query,

                isOnlyOnePost: isOnlyOnePost
            };

            this.setLogicCache(data, result);

            return result;
        }
    });
});
