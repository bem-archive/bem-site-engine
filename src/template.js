var VM = require('vm'),
    fs = require('fs'),
    Vow = require('vow'),
    PATH = require('path'),
    config = require('./config'),
    JsonStringify = require('json-stringify-safe'),
    leJsPath = require('./le-jspath'),
    leLogic = require('./le-logic'),
    leStatics = new (require('../lib/Statics').Statics)(config.get('statics')),
    leBundles = new (require('../lib/Bundles').Bundles)({ defaultLOD: 'desktop' }),
    commonPath = PATH.join(__dirname, 'desktop.bundles/common'),
    bemtree = fs.readFileSync(PATH.join(commonPath, 'common.bemtree.js')),
    bemhtml = fs.readFileSync(PATH.join(commonPath, 'common.bemhtml.js')),
    i18n_keys = fs.readFileSync(PATH.join(commonPath, 'common.i18n', 'all.keys.js')),
    ctx = {
        Vow: Vow,
        leJsPath: leJsPath,
        leLogic: leLogic,
        leStatics: leStatics,
        leBundles: leBundles,
        console: console
    };

VM.runInNewContext(i18n_keys, ctx);
VM.runInNewContext(bemtree, ctx);
VM.runInNewContext(bemhtml, ctx);

var BEMTREE = ctx.BEMTREE,
    BEMHTML = ctx.BEMHTML;

exports.apply = function(ctx, mode) {
    return BEMTREE.apply(ctx)
        .then(function(bemjson) {
            if ('bemjson' === mode) {
                return JsonStringify(bemjson, null, 2);
            }

            return BEMHTML.apply(bemjson);
        });
};

exports.BEMTREE = BEMTREE;
exports.BEMHTML = BEMHTML;