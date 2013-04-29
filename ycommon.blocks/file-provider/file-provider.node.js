(function() {

var PATH = require('path'),
    FS = require('vow-fs');


modules.define(
    'file-provider',
    ['inherit', 'objects', 'vow'],
    function(provide, inherit, objects, Vow) {

function processData(data, typ) {
    switch(typ) {

    case 'json':
        return JSON.parse(data);

    default:
        return data;

    }
}

provide(inherit({

    __constructor : function(params) {
        this.params = objects.extend(this.getDefaultParams(), params);
    },

    run : function() {
        var params = this.params;

        return FS.read(params.path, params.encoding)
            .then(
                function(data) {
                    return processData(data, params.dataType);
                }
            );
    },

    abort : function() {},

    getDefaultParams : function() {
        return {
            'encoding' : 'utf8',
            'dataType' : 'text'
        };
    }

}, {

    create : function(params) {
        return new this(params);
    }

}));

});

}());