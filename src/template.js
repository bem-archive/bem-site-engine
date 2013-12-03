var VM = require('vm'),
    fs = require('fs'),
    Vow = require('vow'),
    PATH = require('path'),
    JsonStringify = require('json-stringify-safe'),
    datasrc = require('../datasrc/data.json'),
    leJsPath = require('./le-jspath'),
    leLogic = require('./le-logic'),
    commonPath = PATH.join(__dirname, 'desktop.bundles/common'),
    bemtree = fs.readFileSync(PATH.join(commonPath, 'common.bemtree.js')),
    bemhtml = fs.readFileSync(PATH.join(commonPath, 'common.bemhtml.js')),
    i18n_keys = fs.readFileSync(PATH.join(commonPath, 'common.i18n', 'all.keys.js')),
    ctx = {
        Vow: Vow,
        console: console,
        datasrc: datasrc,
        leJspath: leJsPath,
        leLogic: leLogic
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