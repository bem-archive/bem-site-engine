var VM = require('vm'),
    VowFs = require('vow-fs'),
    vow = require('vow'),
    PATH = require('path'),
    config = require('./config'),
    JsonStringify = require('json-stringify-safe'),
    leJsPath = require('./le-jspath'),
    leLogic = require('./le-logic'),
    leStatics = new (require('../lib/Statics').Statics)(config.get('statics')),
    leBundles = new (require('../lib/Bundles').Bundles)({ defaultLOD: 'desktop' });

if ('production' === process.env.NODE_ENV) {
    var ctxPromise = _compileCtx();

    exports.apply = function(ctx, lang, mode) {
        return ctxPromise
            .then(function(templates) {
                return _applyFunc(templates.BEMTREE, templates.BEMHTML, templates.BEM.I18N).call(null, ctx, lang, mode);
            });
    };
} else {
    exports.apply = function(ctx, lang, mode) {
        return _rebuild()
            .then(function() {
                return _compileCtx();
            })
            .then(function(templates) {
                return _applyFunc(templates.BEMTREE, templates.BEMHTML, templates.BEM.I18N).call(null, ctx, lang, mode);
            });
    };
}

function _compileCtx() {
    var targets = ['lang.all.js', 'lang.en.js', 'lang.ru.js', 'bemtree.js', 'bemhtml.js'],
        ctx = {
            Vow: vow,
            leJsPath: leJsPath,
            leLogic: leLogic,
            leStatics: leStatics,
            leBundles: leBundles,
            console: console
        };

    return vow.all(targets.map(function(target) {
            var targetPath = PATH.join(__dirname, 'desktop.bundles', 'common', '_common.' + target);
            return VowFs.read(targetPath, 'utf-8');
        }))
        .then(function(targetSources) {
            targetSources.forEach(function(targetSource) {
                VM.runInNewContext(targetSource, ctx);
            });

            return ctx;
        });
}

function _rebuild() {
    var enbBuilder = require('enb/lib/server/server-middleware').createBuilder({ cdir: PATH.join(__dirname, '..') }),
        commonPath = 'src/desktop.bundles/common/_common.';

    return vow.all([
        enbBuilder(commonPath + 'bemtree.js'),
        enbBuilder(commonPath + 'bemhtml.js'),
        enbBuilder(commonPath + 'lang.all.js'),
        enbBuilder(commonPath + 'lang.ru.js'),
        enbBuilder(commonPath + 'lang.en.js')
    ]);
}

function _applyFunc(BEMTREE, BEMHTML, I18N) {
    return function(ctx, lang, mode) {
        I18N.lang(lang);
        return BEMTREE.apply(ctx)
            .then(function(bemjson) {
                if ('bemjson' === mode) {
                    return JsonStringify(bemjson, null, 2);
                }

                return BEMHTML.apply(bemjson);
            });
    };
}
