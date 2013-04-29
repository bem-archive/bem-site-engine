modules.define(
    'yana-template',
    ['yana-config', 'yana-logger', 'http-provider', 'file-provider', /*'ya-auth',*/ 'vow'],
    function(provide, config, logger, httpProvider, fileProvider, /*yaAuth,*/ Vow) {

var PATH = require('path'),
    VM = require('vm'),
    VFS = require('vow-fs'),
    cache = {},
    DEBUG = config.debug;

provide({

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
        return VFS.read(path).then(VM.createScript)
            .then(function(bemtree) {
                bemtree.runInNewContext(ctx);
                return ctx.BEMTREE;
            });
    },

    getPath : function(name, typ) {
        var path = config.bundles_root;
        return PATH.join(path, name, [name, '.', typ].join(''));
    },

    loadFromCache : function(name) {
        if(cache[name]) {
            logger.debug('Template "%s" cache hit', name);
            return cache[name];
        }
    },

    loadFromFs : function(name) {
        var bemhtml = this.getPath(name, 'bemhtml.js'),
            bemtree = this.getPath(name, 'bemtree.xjst.js');

        return Vow.all([this.getBemhtml(bemhtml), this.getBemtree(bemtree)])
            .spread(function(bemhtml, bemtree) {
                return cache[name] = { bemhtml : bemhtml, bemtree : bemtree };
            });
    },

    load : function(name) {
        var templates;

        DEBUG || (templates = this.loadFromCache(name));
        templates || (templates = this.loadFromFs(name));

        return Vow.promise(templates);
    }

});

});