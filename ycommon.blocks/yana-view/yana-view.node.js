modules.define(
    'yana-view',
    ['yana-template', 'yana-config', 'yana-logger', 'yana-util'],
    function(provide, template, config, logger, util, View) {

var URL = require('url'),
    JsonStringify = require('json-stringify-safe');

View.decl('yana-view', {

    __constructor : function() {
        this.__base.apply(this, arguments);

        this._template = this._loadTemplate();
    },

    createContext : function() {
        var route = this.req.route;
        return {
            req : this.req,
            res : this.res,
            params : this.params,
            view : this._getName(),
            page : route.data.name,
            bundleName : config.common_bundle_name,
            staticUrl : URL.resolve(
                    config.static_host, config.common_bundle_path),
            yaApiHosts : config.hosts
        };
    },

    getMode : function() {
        return this.req.query.__mode;
    },

    _loadTemplate : function() {
        return template.load(config.common_bundle_name);
    },

    _buildBemjson : function(ctx) {
        return this._template.then(function(t) { return t.bemtree.apply(ctx) });
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
        }, this);
    }

});

provide(View);

});
