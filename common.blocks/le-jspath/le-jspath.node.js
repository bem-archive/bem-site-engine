/* jshint node:true */
/* global modules:false */

modules.define(
    'le-jspath', ['inherit', 'objects'],
    function(provide, inherit, objects) {

var jspath = require('jspath');
var JsonStringify = require('json-stringify-safe');

provide({

    filter: function(selector, json, substitution) {
        return jspath.apply(selector, json, substitution);
    },

    stringify: function(object) {
        console.log('STRINGIFY ' + JsonStringify(object, null, 2));
        //return JsonStringify(object, null, 2);
    }
});

});
