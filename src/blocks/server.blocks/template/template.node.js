var path = require('path'),
    vm = require('vm'),

    vow = require('vow'),
    vfs = require('vow-fs'),
    stringify = require('json-stringify-safe');

modules.define('template', ['config', 'logger', 'util', 'builder', 'bundles', 'statics'],
    function(provide, config, logger, util, builder, bundles, statics) {

        logger = logger(module);

        var target = 'src/bundles/desktop.bundles/common/common.min.template.i18n.js',
            context = {
                Vow: vow,
                leStatics: new (statics.Statics)(config.get('app:statics')),
                leBundles: new (bundles.Bundles)({ defaultLOD: 'desktop' }),
                logger: logger
            };

        provide({
            apply: function(ctx, lang, mode) {
                var builder =  util.isDev() ? builder : { build: function() { return vow.resolve(); } };

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
            }
        });
});
