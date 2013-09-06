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
    },`

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
