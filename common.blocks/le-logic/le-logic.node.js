/*global modules:false */

modules.define(
    'le-logic', ['inherit', 'objects', 'yana-logger', 'le-jspath'],
    function(provide, inherit, objects, logger, leJspath) {

    provide({

        _logicCache: {},

        /**
         * Genenrates cache key for logic cache
         * @param  {Object} data - object with request and response params
         * @return {String} key which build from current locale and request path
         */
        generateKey: function(data) {
            return data.lang + ':' + data.req.path;
        },

        /**
         * Returns logic cache by data request path
         * @param  {Object} data - object with request and response params
         * @return {Object} - object with params of data
         */
        getLogicCache: function(data) {
            return this._logicCache[this.generateKey(data)];
        },

        /**
         * Sets logic cache
         * @param  {Object} data - object with request and response params
         * @param  {Object} value - object with params of data
         */
        setLogicCache: function(data, value) {
            this._logicCache[this.generateKey(data)] = value;
        },

        /**
         * Implements logic for resolving methodology urls
         * @param  {Object} data - object with request and response params
         * @return {Object} result - object with params of data
         *  - error {Object} error with  status and error code or false
         *  - type - {String} type of resource
         *  - category - {String} category of resource
         *  - id - {String} unique id if resource
         *  - query - {Object} query object for menu block
         */
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

                //если в запросе был передан slug поста, то пробуем найти пост по чатичному совпадению
                //его полного url-а c адрестной строкой в браузере
                //если пост не был найден то показываем 404 ошибку
                //если в запросе не был передан slug поста то показываем корневой пост
                if(id) {
                    var res = leJspath.findByUrl(data.req.path, data.lang);
                    if(!res) {
                        result.error = { state: true, code: 404 };
                    }else {
                        res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang);
                        result.id = res.id;
                        result.category = res.category;
                    }
                }else {
                    result.id = rootId;
                }

            }catch(e) {
                result = {
                    error: { state: true, code: 500 }
                };
            }finally {
                //кешируем построенный результат и возвращаем его
                this.setLogicCache(data, result);
                return result;
            }
        },

        /**
         * Implements logic for resolving articles urls
         * @param  {Object} data - object with request and response params
         * @return {type} result - object with params of data
         *  - error {Object} error with  status and error code or false
         *  - type - {String} type of resource
         *  - category - {String} category of resource
         *  - id - {String} unique id if resource
         *  - query - {Object} query object for menu block
         */
        resolveArticles: function(data) {
            //достаем закешированный результат
            var result = this.getLogicCache(data);

            //если он есть то возвращаем его
            if(result) return result;

            try {
                //Делаем проверку на то, что мы находимся в корне раздела articles
                //составляем первичный объект с результатами обработки логики
                var type = data.page,
                    isRoot = Object.getOwnPropertyNames(data.params).length == 0,
                    result = {
                        error: false,
                        type: type,
                        id: null,
                        category: null,
                        query: {
                            predicate: '.' + data.lang + '{.type === $type}',
                            substitution: { type: type }
                        }
                    };

                //Если мы не находимся в корне раздела статей, то пытаемся найти  пост по полному совпадению
                //его полного url с data.req.path. Если пост не находится то показываем 404 ошибку
                //если находится то дополнительно прогоняем через поиск для определения категории
                if(!isRoot) {
                    var res = leJspath.findByUrl(data.req.path, data.lang);
                    if(!res) {
                        result.error = { state: true, code: 404 };
                    }else {
                        res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang);
                        result.id = res.id;
                        result.category = res.category;
                    }
                }

            }catch(e) {
                result = {
                    error: { state: true, code: 500 }
                }
            }finally {
                //кешируем построенный результат и возвращаем его
                this.setLogicCache(data, result);
                return result;
            }
        },

        /**
         * Implements logic for resolving news urls
         * @param  {Object} data - object with request and response params
         * @return {type} result - object with params of data
         *  - error {Object} error with  status and error code or false
         *  - type - {String} type of resource
         *  - category - {String} category of resource
         *  - id - {String} unique id if resource
         *  - query - {Object} query object for menu block
         */
        resolveNews: function(data) {
            //достаем закешированный результат
            var result = this.getLogicCache(data);

            //если он есть то возвращаем его
            if(result) return result;

            try {
                var type = data.page,
                isRoot = Object.getOwnPropertyNames(data.params).length == 0,

                result = {
                    error: false,
                    type: type,
                    id: null,
                    category: null,
                    query: {
                        predicate: '.' + data.lang + '{.type === $type}',
                        substitution: { type: type }
                    }
                };

                //Если мы не находимся в корне раздела новостей, то пытаемся найти  пост по полному совпадению
                //его полного url с data.req.path. Если пост не находится то показываем 404 ошибку
                //если находится то дополнительно прогоняем через поиск для определения категории
                if(!isRoot) {
                    var res = leJspath.findByUrl(data.req.path, data.lang);
                    if(!res) {
                        result.error = { state: true, code: 404 };
                    }else {
                        res = leJspath.findCategoryAndIdByUrl(data.req.path, type, data.lang);
                        result.id = res.id;
                        result.category = res.category;
                    }
                }
            }catch(e) {
                result = {
                    error: { state: true, code: 500 }
                }
            }finally {
                //кешируем построенный результат и возвращаем его
                this.setLogicCache(data, result);
                return result;
            }
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
