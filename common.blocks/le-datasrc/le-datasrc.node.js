/* jshint node:true */
/* global modules:false */

modules.define(
    'le-datasrc',
    ['file-provider', 'yana-config', 'yana-error_type_http'],
    function(provide, fileProvider, config, HttpError) {

var PATH = require('path'),
    datasrc = config.hosts.datasrc;

provide({

    _buildPath : function(params) {
        var path = params.lib?
            [datasrc.root, '_' + params.lib, 'blocks'] :
            [datasrc.root, '_libs'];

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
    },

    /**
     * Returns data for articles for bem-info
     * @param  {Object} params object
     * @return {JSON} json file content
     */
    loadData : function(params) {
        var path = PATH.join.apply(null, [datasrc.root, 'data']) + '.json';

        this._data = fileProvider.create({ path : path, dataType : 'json' })
            .run()
            .fail(function(err) {
                var message = 'Data for bem-info not found';
                throw new HttpError(404, message);
            });

        return this._data;
    }

});

});
