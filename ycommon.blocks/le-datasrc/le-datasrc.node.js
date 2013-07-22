/* jshint node:true */
/* global modules:false */

(function() {

var PATH = require('path');

modules.define(
    'le-datasrc',
    ['file-provider', 'yana-config', 'yana-error_type_http'],
    function(provide, fileProvider, config, HttpError) {

var datasrc = config.hosts.datasrc;

provide({

    _buildPath : function(params) {
        var path = params.lib ? 
            [datasrc.root, '_' + params.lib, 'blocks'] :
            [datasrc.root, '_libraries', 'libraries'];

        params.block && path.push(params.block);

        return PATH.join.apply(null, path) + '.json';
    },

    _do : function(params) {
        var path = this._buildPath(params);
        return fileProvider.create({ path : path, dataType : 'json' })
            .run()
            .fail(function(err) {
                var message = 'Block "' + params.block + '" for library "' + params.lib + '" not found';
                throw new HttpError(404, message);
            });
    },

    libInfo : function(params) {
        return this._do(params);
    },

    blockInfo : function(params) {
        return this._do(params);
    }

});

});

}());