modules.define(
    'yana-view',
    ['yana-config', 'yana-logger', 'yana-util'],
    function(provide, config, logger, util, View) {

View.decl('le-page', {

    createContext : function() {
        var route = this.req.route,
            hosts = config.hosts;
        return {
            req : this.req,
            res : this.res,
            params : this.params,
            view : this._getName(),
            page : route.data.name,
            bundleName : config.common_bundle_name,
            staticUrl  : ''.concat(hosts.static.host, config.common_bundle_path),
            yaApiHosts : hosts,
            lang: this._lang(this.req)
        };
    },

    _lang: function(req) {
        var LANGS = ['en', 'ru', 'ja'],
            DEFAULT_LANG = 'en';

        var headers = req.headers,
            host = headers.host,
            lang = host ? host.split('.')[0] : DEFAULT_LANG;
        return LANGS.indexOf(lang) > -1 ? lang : DEFAULT_LANG;
    }

});

provide(View);

});
