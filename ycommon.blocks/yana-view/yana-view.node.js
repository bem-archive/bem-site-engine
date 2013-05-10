modules.define(
    'yana-view',
    ['inherit', 'yana-template', 'yana-config', 'yana-logger', 'yana-util'],
    function(provide, inherit, template, config, logger, util, View) {

var URL = require('url'),
    JsonStringify = require('json-stringify-safe');

provide(View.decl('yana-view', {

    __constructor : function() {
        this.__base.apply(this, arguments);

        this._template = template.load(config.common_bundle_name);
    },

    createContext : function() {
        var route = this._req.route;
        return {
            req : this._req,
            res : this._res,
            params : this._params,
            view : this._getName(),
            page : route.name,
            bundleName : config.common_bundle_name,
            staticUrl : URL.resolve(
                    config.static_host, config.common_bundle_path),
            yaApiHosts : config.hosts,
        };
    },

    getMode : function() {
        return this._req.query.__mode;
    },

    _buildBemjson : function(ctx) {
        return this._template.then(function(t) { return t.bemtree.call(ctx) });
    },

    _buildHtml : function(bemjson) {
        return this._template.then(function(t) { return t.bemhtml.apply(bemjson) });
    },

    render : function(ctx) {
        logger.debug('Going to render page "%s"', this._getName());

        return this._buildBemjson(ctx).then(function(json) {
            if(this.getMode() === 'json') {
                return util.format('<pre>%s</pre>', JsonStringify(json, null, 2));
            }

            return this._buildHtml(json);
        }.bind(this));
    }

}));

});
