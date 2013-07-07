/* jshint node:true */
/* global modules:false */

modules.define(
    'yana-template',
    ['yana-config', 'yana-logger', 'yana-util', 'yana-template__context', 'vow'],
    function(provide, config, logger, util, context, Vow, template) {

var PATH = require('path'),
    VM = require('vm'),
    FS = require('vow-fs');

provide(util.extend(template, {

    createContext : function() {
        return context;
    },

    _fillContext : function(ctx, code) {
        VM.runInNewContext(code, ctx);
        return ctx;
    },

    fillContext : function(path, ctx) {
        logger.debug('Going to fill "%s" context', path);
        return FS.read(path)
            .then(this._fillContext.bind(this, ctx));
    },

    getPath : function(name, typ) {
        var path = config.bundles_root;
        return PATH.join(path, name, [name, '.', typ].join(''));
    },

    loadFromFs : function(name) {
        var ctx = this.createContext(),
            i18n = this.getPath(name, 'i18n/all.keys.js'),
            bemhtml = this.getPath(name, 'bemhtml.js'),
            bemtree = this.getPath(name, 'bemtree.js'),
            cache = this._cache;

        return Vow.when(ctx)
            .then(this.fillContext.bind(this, i18n))
            .then(function(ctx) {
                return Vow.all([
                    this.fillContext(bemhtml, ctx),
                    this.fillContext(bemtree, ctx)
                ]);
            }, this)
            .spread(function(ctx) {
                return cache[name] = { bemhtml : ctx.BEMHTML, bemtree : ctx.BEMTREE };
            });
    }

}));

});
