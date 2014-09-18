var path = require('path'),
    vm = require('vm'),

    vow = require('vow'),
    vfs = require('vow-fs'),
    stringify = require('json-stringify-safe');

modules.define('template', ['config', 'util', 'builder', 'bundles', 'statics'],
    function(provide, config, util, builder, bundles, statics) {

        var target = 'src/bundles/desktop.bundles/common/common.min.template.i18n.js',
            context = {
                Vow: vow,
                leStatics: new (statics.Statics)(config.get('statics')),
                leBundles: new (bundles.Bundles)({ defaultLOD: 'desktop' }),
                console: console
            };

        provide({
            apply: function(ctx, req, mode) {
                return builder
                    .build([target])
                    .then(function() {
                        return vfs.read(path.join(process.cwd(), target)).then(function(source) {
                            context.req = req;
                            vm.runInNewContext(source, context);
                            return context;
                        });
                    })
                    .then(function(engine) {
                        engine.BEM.I18N.lang(req.lang);

                        return engine.BEMTREE.apply(ctx)
                            .then(function(bemjson) {
                                return mode === 'bemjson' ?
                                    stringify(bemjson, null, 2) : engine.BEMHTML.apply(bemjson);
                            });
                    });
            }
        });
});
