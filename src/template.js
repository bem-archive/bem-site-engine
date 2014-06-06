var path = require('path'),
    vm = require('vm'),

    vow = require('vow'),
    vfs = require('vow-fs'),
    stringify = require('json-stringify-safe'),

    util = require('./util'),
    config = require('./config'),

    target = 'src/bundles/desktop.bundles/common/common.min.template.i18n.js',
    context = {
        Vow: vow,
        leStatics: new (require('../lib/Statics').Statics)(config.get('app:statics')),
        leBundles: new (require('../lib/Bundles').Bundles)({ defaultLOD: 'desktop' }),
        logger: require('./logger')(module)
    };

/**
 * Rebuilds templates in dev mode
 * pass context to bemtree template
 * run templates with ctx and return compiled html or bemjson depending on mode flag
 * @param ctx - {Object} context for templates
 * @param lang - {String} localization
 * @param mode - {String} mode for return format
 * @returns {*}
 */
exports.apply = function(ctx, lang, mode) {
    var builder =  util.isDev() ? require('./builder') : { build: function() { return vow.resolve(); } };

    return builder
        .build([target])
        .then(function() {
            return vfs.read(path.join(process.cwd(), target)).then(function(source) {
                vm.runInNewContext(source, context);
                return context;
            })
        })
        .then(function(engine) {
            engine.BEM.I18N.lang(lang);

            return engine.BEMTREE.apply(ctx)
                .then(function(bemjson) {
                    return mode === 'bemjson' ?
                        stringify(bemjson, null, 2) : engine.BEMHTML.apply(bemjson);
                });
        });
};
