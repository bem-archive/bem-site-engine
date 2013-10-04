/* jshint node:true */
/* global modules:false */

modules.define(
    'le-jspath', ['inherit', 'objects', 'yana-logger'],
    function(provide, inherit, objects, logger) {

var jspath = require('jspath');
var JsonStringify = require('json-stringify-safe');

provide({

    /**
     * Returns founded data from json by selector with substitutions
     * @param  {String} selector - query selector
     * @param  {JSON} json - target json
     * @param  {Object} substitution - key-value substitution hash
     * @return Object - filter result
     */
    find: function(selector, json, substitution) {
         return jspath.apply(selector, json, substitution);
    },

    parseQuery: function(data, key) {
        var type = data.params.type || data.page, //тип данных
            query = data.req.query[key], //хэш с параметрами запросa
            config = [];

        if(key === 'filter') {
            config.push({ field: 'type', operand: '===', value: type });

            //при наличии параметров фильтрации мы парсим строку
            //с этими параметрами и заполняем хэш с ключами
            //названия поля, операнда сравлнения и значения
            if(query && query.length > 0) {
                query = query.split(',');

                for(var i = 0; i < query.length; i++) {
                    var condition = query[i].split(' ');
                    config.push({
                        field : condition[0],
                        operand : condition[1],
                        value : condition[2]
                    });
                }
            }
        }

        if(key === 'sort') {
            if(query && query.length > 0) {

                //парсим строку с параметрами поиска и формируем массив хэшей типа
                //{field "field", direction: "direction"} коорый полсностью описывает характеристики сортировки
                query = query.split(',');

                for(var i = 0; i < query.length; i++) {
                    var condition = query[i].split(' ');
                    config.push({field : condition[0], direction : (condition[1] || 'asc') })
                }
            }
        }

        if(key === 'page') {
            var page = query;
            var limit = data.req.query['limit'];

            config.push({ page : page, limit: limit });
        }

        return config;
    },

    /**
     * Filter method for result set
     * @param  {JSON} content
     * @param  {Object} config - object with filter configuration parameters
     * @param  {String} lang - localization
     * @return {Array} filtered content
     */
    filter: function(content, config, lang) {
        var lang = lang || 'en', //язык локализации
            predicate = '', //предикат фильтрации
            substitution = {}; //хэш подстановок

        //выстраиваем предикат фильтрации и объект подстановок по хэшу config
        predicate += '.' + lang;


        if(config) {
            for(var i = 0; i < config.length; i++) {
                if(config[i]) {
                    predicate += '{.' + config[i]['field'] + ' ' + config[i]['operand'] + '"' + config[i].value + '"}';
                }
            }
        }

        //logger.debug(predicate);

        //фильтруем данные по предикату и объекту подстановок
        //return jspath.apply(predicate, content, substitution);
        return jspath.apply(predicate, content);
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
            if(!config[index])
               return 0;

            var field = config[index]['field'], //поле, по которому производится сортировка
                desc = config[index]['direction'] === 'desc'; //направление сортировки

            if(a[field] > b[field]) {
                return desc ? -1 : 1;
            } else if(a[field] < b[field]) {
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
     * Pagination method for result set
     * @param  {Array} content - full result set
     * @param  {Array} config - object with pagination configuration parameters
     * @param  {Number} defaultLimit - default number of records per page
     * @return {Array} - sliced array according to pagnation parameters
     */
    paginate: function(content, config, defaultLimit) {

        if(!config) {
            return content;
        }

        config = config[0];

        //проверка page и limit. Если не заданы или имеют неверный формат, то page = 1
        //limit = defaultLimit (10)
        var page = (config.page && !isNaN(parseFloat(config.page)) && isFinite(config.page)) ? config.page : 1,
            limit = (config.limit && !isNaN(parseFloat(config.limit)) && isFinite(config.limit)) ? config.limit : defaultLimit;

        //вырезаем нужный набор записей из исходного массива
        return page * limit  <= content.length ?
                content.slice((page - 1) * limit, page * limit) :
                content.slice((page - 1) * limit);
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
                    if ( equals(arr[i], val) ) {
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

        return arr
    },

    findByIdAndType: function(source, id, type, lang) {
        var config = [],
            result = null;

        id && config.push({ field: 'id', operand: '===', value: id });
        type && config.push({ field: 'type', operand: '===', value: type });

        result = this.filter(source, config, lang);

        return (result && result.length > 0) ? result.shift() : null;
    },

    isExist: function(source, id, type, lang) {
        var config = [];

        id && config.push({ field: 'id', operand: '===', value: id });
        type && config.push({ field: 'type', operand: '===', value: type });

        return this.filter(source, config, lang).length > 0;
    }
});

});
