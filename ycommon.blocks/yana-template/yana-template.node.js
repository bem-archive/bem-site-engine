(function() {

var PATH = require('path'),
    VM = require('vm'),
    FS = require('vow-fs');

modules.define(
    'yana-template',
    ['yana-config', 'yana-logger', 'yana-util', 'http-provider', 'file-provider', 'ya-auth', 'le-datasrc', 'vow'],
    function(provide, config, logger, util, httpProvider, fileProvider, yaAuth, leDatasrc, Vow, template) {

provide(util.extend(template, {

    getBemhtml : function(path) {
        return require(path).BEMHTML;
    },

    getBemtree : function(path) {
        var ctx = {
                exports : exports,
                require : require,
                console : logger,
                httpProvider : httpProvider,
                fileProvider : fileProvider,
                yaAuth : yaAuth,
                leDatasrc : leDatasrc,
                Vow : Vow
            };
        return FS.read(path).then(VM.createScript)
            .then(function(bemtree) {
                bemtree.runInNewContext(ctx);
                return ctx.exports.BEMTREE;
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