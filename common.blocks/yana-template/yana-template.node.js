(function() {

var PATH = require('path'),
    VM = require('vm'),
    FS = require('vow-fs');

modules.define(
    'yana-template',
    ['yana-config', 'yana-util', 'http-provider', 'file-provider', /*'ya-auth',*/ 'vow'],
    function(provide, config, util, httpProvider, fileProvider, /*yaAuth,*/ Vow, template) {

provide(util.extend(template, {

    getBemhtml : function(path) {
        return require(path).BEMHTML;
    },

    getBemtree : function(path) {
        var ctx = {
                BEMTREE : {},
                require : require,
                console : console,
                httpProvider : httpProvider,
                fileProvider : fileProvider,
                yaAuth : false, //yaAuth,
                Vow : Vow
            };
        return FS.read(path).then(VM.createScript)
            .then(function(bemtree) {
                bemtree.runInNewContext(ctx);
                return ctx.BEMTREE;
            });
    },

    getPath : function(name, typ) {
        var path = config.bundles_root;
        return PATH.join(path, name, [name, '.', typ].join(''));
    },

    loadFromFs : function(name) {
        var bemhtml = this.getPath(name, 'bemhtml.js'),
            bemtree = this.getPath(name, 'bemtree.xjst.js'),
            cache = this._cache;

        return Vow.all([this.getBemhtml(bemhtml), this.getBemtree(bemtree)])
            .spread(function(bemhtml, bemtree) {
                return cache[name] = { bemhtml : bemhtml, bemtree : bemtree };
            });
    }

}));

});

}());