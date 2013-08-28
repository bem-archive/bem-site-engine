/* jshint node:true */
/* global modules:false */

modules.define(
    'le-jspath',
    function(provide) {

var jspath = require('jspath');

provide({

    filter: function(selector, json, substitution) {
        // console.log('JSPATH');
        // console.log(jspath);
        // console.log('SELECTOR');
        // console.log(selector);
        // console.log('JSON');
        // console.log(json);

        return jspath.apply(selector, json, substitution);
    }
});

});
