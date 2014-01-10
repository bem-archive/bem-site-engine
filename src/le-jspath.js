var jspath = require('jspath'),
    JsonStringify = require('json-stringify-safe');

module.exports = {
    _source: null,

    getSource: function() {
        return this._source;
    },

    setSource: function(source) {
        this._source = source;
    },

    /**
     * Returns founded data from json by selector with substitutions
     * @param  {String} predicate - query selector
     * @param  {Object} substitution - key-value substitution hash
     * @return Object - filter result
     */
    find: function(predicate, substitution) {
        return jspath.apply(predicate, this.getSource(), substitution);
    },

    /**
     * Filter method for result set
     * @param  {Object} config - object with filter configuration parameters
     * @param  {String} lang - localization
     * @return {Array} filtered content
     */
    filter: function(config, lang) {
        var lang = lang || 'en', //язык локализации
            predicate = ''; //предикат фильтрации

        //выстраиваем предикат фильтрации и объект подстановок по хэшу config
        predicate += '.' + lang;

        if (config) {
            for (var i = 0; i < config.length; i++) {
                if (config[i]) {
                    predicate += '{.' + config[i].field + ' ' + config[i].operand + '"' + config[i].value + '"}';
                }
            }
        }

        //logger.debug(predicate);

        //фильтруем данные по предикату и объекту подстановок
        //return jspath.apply(predicate, content, substitution);
        return jspath.apply(predicate, this.getSource());
    },

    /**
     * Sorting method for content
     * @param  {Array} content - unsorted content
     * @param  {Array} config - object with sorting configuration parameters
     * @return {Array} ordered array
     */
    sort: function(content, config) {

        //метод сравнения элементов a и b
        //в случае, когда a = b, то рекурсивно запускается метод сортировки для следующего поля
        //это позволяет реализовать сортировку по нескольким полям
        function compare(a, b, config, index) {
            index = index || 0;
            if (!config[index]) {
                return 0;
            }

            var field = config[index].field, //поле, по которому производится сортировка
                desc = config[index].direction === 'desc'; //направление сортировки

            if (a[field] > b[field]) {
                return desc ? -1 : 1;
            } else if (a[field] < b[field]) {
                return desc ? 1 : -1;
            } else {
                return compare(a, b, config, ++index); //рекурсивный запуск этой же функции
            }
        }

        return (config && config.length > 0) ? content.sort(function(a, b) {
            return compare(a, b, config);
        }) : content;
    },

    /**
     * Utility method for development, stringify
     * object and place it into console log
     * @param  {Object} object target object which should be stringified
     */
    stringify: function(object) {
        console.log('LOG ' + JsonStringify(object, null, 2));
    },

    /**
     * Removes dublicate objects from array
     * @param  {Array} arr - target array
     * @param  {Function} equals - comparator
     * @return {Array} - array with unique objects
     */
    removeDublicates: function(arr, equals) {

        var originalArr = arr.slice(0),
            val,
            arrayContains = function(arr, val, equals) {
                var i = arr.length;
                while (i--) {
                    if (equals(arr[i], val)) {
                        return true;
                    }
                }
                return false;
            };

        arr.length = 0;

        for (var i = 0; i < originalArr.length; ++i) {
            val = originalArr[i];
            if (!arrayContains(arr, val, equals)) {
                arr.push(val);
            }
        }

        return arr;
    },

    findByIdAndType: function(id, type, lang) {
        var config = [],
            result = null;

        id && config.push({ field: 'id', operand: '===', value: id });
        type && config.push({ field: 'type', operand: '===', value: type });

        result = this.filter(config, lang);

        return (result && result.length > 0) ? result.shift() : null;
    },

    findById: function(id, lang) {
        var result = this.find('.' + lang + '{.id === $id}', { id: id });
        return (result && result.length > 0) ? result[0] : null;
    },

    findByUrl: function(url, lang) {
        var result = this.find('.' + lang + '{.url === $url1 || .url === $url2}', { url1: url, url2: url + '/' });
        return (result && result.length > 0) ? result[0] : null;
    },

    findBySlug: function(slug, lang) {
        var result = this.find('.' + lang + '{.slug === $slug}', { slug: slug });
        return (result && result.length > 0) ? result[0] : null;
    },

    findByTypeAndSlug: function(type, slug, lang) {
        var result = this.find('.' + lang + '{.type === $type}{.slug === $slug}', { type: type, slug: slug });
        return (result && result.length > 0) ? result[0] : null;
    },

    /**
     * Find source by type, url and lang criteria
     * @param  {String} type -type of source
     * @param  {String} url - url of source
     * @param  {String} lang - language
     * @return {Object} - source founded by search criteria or null if source was not found
     */
    /*
     findByTypeAndUrl: function(type, url, lang) {
     var result = this.find('.' + lang + '{ .type === $type }{ .url === $url }', { type: type, url: url });
     return (result && result.length > 0) ? result[0] : null;
     },
     */

    findRootPostId: function(type, lang) {
        var result = this.filter([
                    { field: 'type', operand:  '===', value: type },
                    { field: 'root', operand:  '===', value: true }
                ], lang),
            rootId = null;

        result.forEach(function(item) {
            if (item.categories && item.categories.length === 0) {
                rootId = item.id;
            }
        });

        return rootId;
    },

    findRootPostIdByCategory: function(type, category, lang) {
        var predicate = '.' + lang +
                '{.type === $type}' +
                '{.root === "true"}' +
                '{.categories === $category || .categories.url === $category}.id',
            substitution = {
                type: type,
                category: category
            },
            result = this.find(predicate, substitution);

        return (result && result.length > 0) ? result.shift() : null;
    },

    /**
     * Find id and category of post by request path and source type
     * @param  {Stirng} path - request path /{type}/{category}/{id}
     * @param  {String} type - source type
     * @param  {String} lang - source lang
     * @return {Object} {category: category, id: id} - object with category and id of source
     */
    findCategoryAndIdByUrl: function(path, type, lang) {
        var result = null,
            find = null,
            posts = this.find('.' + lang + '{.type === $type}', { type: type });

        //поиск по связке тип + категория + url
        posts.forEach(function(post) {
            post.categories.forEach(function(category) {
                category = category.url || category;
                find = path.indexOf([type, category, post.slug].reduce(function(prev, item) {
                    return prev + ((item && item.length > 0) ? ('/' + item) : '');
                }, '')) !== -1;
                if (find) {
                    //logger.debug('find type = %s category = %s url = %s', post.type, category, post.slug);
                    result = { category: category,  id: post.id };
                }
            });
        });

        //поиск по связке тип + url
        result || posts.forEach(function(post) {
            find = path.indexOf([type, post.slug].reduce(function(prev, item) {
                return prev + ((item && item.length > 0) ? ('/' + item) : '');
            }, '')) !== -1;
            if (find) {
                //logger.debug('find type = %s url = %s ', post.type, post.slug);
                result = { id: post.id };
            }
        });

        //поиск по связке тип + категория
        result || posts.forEach(function(post) {
            post.categories.forEach(function(category) {
                category = category.url || category;
                find = path.indexOf([type, category].reduce(function(prev, item) {
                    return prev + ((item && item.length > 0) ? ('/' + item) : '');
                }, '')) !== -1;
                if (find) {
                    //logger.debug('find type = %s category = %s ', post.type, category);
                    result = { category: category };
                }
            });
        });

        return result;
    },

    findCategoryAndIdByManualUrl: function(path, lang) {
        var entities = this.find('.' + lang + '{.manualUrl === $manualUrl}', { manualUrl: path });
        return entities.length > 0 ? entities.shift() : null;
    }
};
