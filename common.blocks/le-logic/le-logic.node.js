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

        resolveMethodology: function(data) {
            //достаем закешированный результат
            var result = this.getLogicCache(data);

            //если он есть то возвращаем его
            if(result) return result;

            try {
                //type устанавливаем по data.page
                //достаем корневой пост по значению type и текущей локали
                //берем slug для поста из параметров запроса
                var type = data.page,
                    rootId = leJspath.findRootPostId(type, data.lang),
                    id = data.params.id;

                result = {
                    error: false,
                    type: type,
                    category: null,
                    query: {
                        predicate: '.' + data.lang + '{.type === $type}{.id !== $rootId}',
                        substitution: { type: type, rootId: rootId }
                    }
                };

                //если в запросе был передан slug поста, то пробуем найти по нему пост
                //если пост не был найден то показываем 404 ошибку
                //если в запросе не был передан slug поста то показываем корневой пост
                if(id) {
                    var res = leJspath.findByTypeAndSlug(type, id, data.lang);
                    if(!res) {
                        result.error = { state: true, code: 404 };
                    }else {
                        result.id = res.id;
                        result.category = res && res.category;
                    }
                }else {
                    result.id = rootId;
                }

            }catch(e) {
                result = {
                    error: { state: true, code: 500 }
                }
            }finally {
                this.setLogicCache(data, result);
                return result;
            }
        },

        resolveArticles: function(data) {
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

        resolveNews: function(data) {
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

        resolveTools: function(data) {
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
        },

        resolveLibraries: function(data) {
            var result = this.getLogicCache(data);

            if(result) return result;

            var type = data.page,
                lib = data.params['lib'] || null,
                version = data.params['version'] || null,
                category = data.params['category'] || null,
                id = data.params['id'],

                predicate = '.' + data.lang + '{ .type == $type }',
                substitution = { type: type },
                query = null;

            var path = data.req.path.split('/').reduce(function(prev, item) {
                return item.length > 0 ? (prev + '/' + item) : (prev + '');
            }, '');


            id = leJspath.findByUrl(path, data.lang);

            id = id && id.id;

            if(lib){
                predicate += '{.categories ^== $category || .categories.url ^== $category }';
                substitution['category'] = lib;


                if(version){
                    substitution['category'] = lib + '/' + version ;
                }

                //поиск корневой статьи для библиотеки и показ ее если не указан id другого поста для библиотеки явно
                var rootId = leJspath.find(predicate + '{.root == "true"}.id', substitution);
                rootId = rootId.length > 0 ? rootId[0] : null;

                if(rootId) {
                    predicate += '{.id !== $rootId}';
                    substitution['rootId'] = rootId;
                    id = id || rootId;
                }
            }

            query = { predicate: predicate, substitution: substitution };

            result = {
                type: type,
                id: id,
                category: category,
                query: query,

                lib: lib,
                version: version
            };

            this.setLogicCache(data, result);

            return result;
        },

        resolveCustomPage: function(data) {
            var result = this.getLogicCache(data);

            if(result) return result;

            var type = 'page',
                res = leJspath.findCategoryAndIdByUrl('/' + type + data.req.path, type, data.lang);

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
        }
    });
});
