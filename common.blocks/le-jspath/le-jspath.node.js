/* jshint node:true */
/* global modules:false */

modules.define(
    'le-jspath', ['inherit', 'objects', 'yana-logger'],
    function(provide, inherit, objects, logger) {

var jspath = require('jspath');
var JsonStringify = require('json-stringify-safe');

provide({

    /**
     * Returns filtered data from json by selector with substitutions
     * @param  {String} selector - query selector
     * @param  {JSON} json - target json
     * @param  {Object} substitution - key-value substitution hash
     * @return Object - filter result
     */

    filter: function(selector, json, substitution) {
         return jspath.apply(selector, json, substitution);
    },

    select: function(content, request) {
        //console.log('LOG filter');

        if(!content || !request)
            return [];

        var params = request.params,
            lang = params.lang || 'en',
            type = params.type || request.page,
            id = params.id,
            query = request.req.query;

        var selector = '.' + lang + '{'

        if(!query || !query.filter || query.filter instanceof Array == false {
            if(id) {
                selector += '.id == "' + id + '"';
            }else if(type) {
                selector += '.type == "' + type + '"'
            }
        }else {
            var filter = query.filter;

            for(var i=0; i < filter.length; i++) {
                selector += i > 0 ? ' && .' : '.';
                selector += filter[i];
            }
        }
        selector += '}';

        console.log('LOG ' + selector);

        return jspath.apply(selector, content, substitution);
    },


    /**
     * Returns sorted data from filtered array of data object
     * @param  {Array} array - target array
     * @param  {String} config - sql like syntax configuration
     * @return {Array} sorted array
     */
    // sort: function(array, request) {

    //     config = config.split(/\s*,\s*/).map(function(prop) {
    //         prop = prop.match(/^([^\s]+)(\s*desc)?/i);
    //         if( prop[2] && prop[2].toLowerCase() === 'desc' ) {
    //             return [prop[1] , -1];
    //         } else {
    //             return [prop[1] , 1];
    //         }
    //     });

    //     function valueCmp(x, y) {
    //         return x > y ? 1 : x < y ? -1 : 0;
    //     }

    //     function arrayCmp(a, b) {
    //         var arr1 = [], arr2 = [];
    //         config.forEach(function(prop) {
    //             var aValue = a[prop[0]],
    //                 bValue = b[prop[0]];

    //             arr1.push( prop[1] * valueCmp(aValue, bValue) );
    //             arr2.push( prop[1] * valueCmp(bValue, aValue) );
    //         });
    //         return arr1 < arr2 ? -1 : 1;
    //     }

    //     array.sort(function(a, b) {
    //         return arrayCmp(a, b);
    //     });
    // },

    paginate: function(array, request) {

    },

    do: function(content, request, config){
        logger.debug('LOG do');

        config = config || {};

        //filter
        content = this.select(content, request);

        //sort
        content = config.sort ? this.sort(content, request) : content;

        //paginate
        content = config.paginate ? this.paginate(content, request) : content;

        return content;
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
