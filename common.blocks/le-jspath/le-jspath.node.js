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

    /**
     * Filter method for result set
     * @param  {Object} ctx - object with full data set and filter parameters
     * @return {Array} filtered array of records
     */
    filter: function(ctx) {
        var content = ctx.content,
            data = ctx.data,
            lang = data.params.lang || 'en', //язык локализации
            type = data.params.type || data.page, //тип данных
            query = data.req.query, //хэш с параметрами запроса
            filter = query.filter, //строка, содержащая все параметры фильтрации
            config = [],
            predicate = '', //предикат фильтрации
            substitution = {}; //хэш подстановок

        config.push({ field: 'type', operand: '===', value: type });

        //при наличии параметров фильтрации мы парсим строку
        //с этими параметрами и заполняем хэш с ключами
        //названия поля, операнда сравлнения и значения
        if(filter && filter.length > 0) {
            filter = filter.split(',');

            for(var i = 0; i < filter.length; i++) {
                var condition = filter[i].split(' ');
                config.push({
                    field : condition[0],
                    operand : condition[1],
                    value : condition[2]
                });
            }
        }

        //выстраиваем предикат фильтрации и объект подстановок по хэшу config
        predicate += '.' + lang;

        for(var i = 0; i < config.length; i++) {
            predicate += '{.' + config[i]['field'] + ' ' + config[i]['operand'] + ' $' + config[i]['field'] + '}';
            substitution[config[i]['field']] = config[i]['value'];
        }

        //фильтруем данные по предикату и объекту подстановок
        return jspath.apply(predicate, content, substitution);
    },

    /**
     * Sort method for result set
     * @param  {Object} ctx - object with unordered result set and sorting parameters
     * @return {Array} sorted array of records
     */
    sort: function(ctx) {
        var array = ctx.content,
            data = ctx.data,
            query = data.req.query,
            sort = query.sort,
            config = [];

        //если параметры сортировки не заданы, то возвращаем исходный набор данных
        //TODO сделать сортировку по дате в обратном порядке как сортироку по умолчанию
        if(!sort || sort.length == 0)
            return array;

        //парсим строку с параметрами поиска и формируем массив хэшей типа
        //{field "field", direction: "direction"} коорый полсностью описывает характеристики сортировки
        sort = sort.split(',');

        for(var i = 0; i < sort.length; i++) {
            var condition = sort[i].split(' ');
            config.push({field : condition[0], direction : (condition[1] || 'asc') })
        }

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

        return array.sort(function(a, b) {
            return compare(a, b, config);
        });
    },

    /**
     * Pagination method for result set
     * @param  {Object} ctx - object with full result set and pagination parameters
     * @return {Array} array of records for current page and limits per page
     */
    paginate: function(ctx) {
        var array = ctx.content, //исходный массив с данными
            data = ctx.data, //контекст view
            query = data.req.query, //хэш параметров запроса
            page = query.page, //текущая страница
            limit = query.limit; //число записей на странице

        //проверка page и limit. Если не заданы или имеют неверный формат, то page = 1
        //limit = defaultLimit (10)
        page = (page && !isNaN(parseFloat(page)) && isFinite(page)) ? page : 1;
        limit = (limit && !isNaN(parseFloat(limit)) && isFinite(limit)) ? limit : ctx.defaultLimit;

        //вырезаем нужный набор записей из исходного массива
        return page * limit  <= array.length ?
                array.slice((page - 1) * limit, page * limit) :
                array.slice((page - 1) * limit);
    },

    /**
     * Utility method for development, stringify
     * object and place it into console log
     * @param  {Object} object target object which should be stringified
     */
    stringify: function(object) {
        console.log('LOG ' + JsonStringify(object, null, 2));
    }
});

});
