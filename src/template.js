var path = require('path'),
    vm = require('vm'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    stringify = require('json-stringify-safe'),
    target = 'src/bundles/desktop.bundles/common/common.min.template.i18n.js',
    config = require('./config'),
    ctx = {
        Vow: vow,
        leApp: require('./modules').leApp,
        leLogic: require('./modules').leLogic,
        leData: require('./modules').leData,
        leStatics: new (require('../lib/Statics').Statics)(config.get('statics')),
        leBundles: new (require('../lib/Bundles').Bundles)({ defaultLOD: 'desktop' }),
        logger: require('./logger')(module)
    };

function apply(ctx, lang, mode) {
    this.BEM.I18N.lang(lang);

    return this.BEMTREE.apply(ctx)
        .then(function(bemjson) {
            if (mode === 'bemjson') {
                return stringify(bemjson, null, 2);
            }

            return this.BEMHTML.apply(bemjson);
        }, this);
}

function preprocess() {
    var fullpath = path.join(__dirname, '..', target);

    return vfs.read(fullpath).then(function(source) {
        vm.runInNewContext(source, ctx);
        return ctx;
    })
}

if (process.env.NODE_ENV === 'production') {
    var preprocessed = preprocess();

    exports.apply = function(ctx, lang, mode) {
        return preprocessed.then(function(templateEngine) {
            return apply.call(templateEngine, ctx, lang, mode);
        });
    };
} else {
    var builder = require('./builder');

    exports.apply = function(ctx, lang, mode) {
        return builder.build([target])
            .then(preprocess)
            .then(function(templateEngine) {
                return apply.call(templateEngine, ctx, lang, mode);
            });
    };
}
