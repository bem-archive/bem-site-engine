var _ = require('lodash'),
    template = require('../template'),
    config = require('../config'),
    logic = require('../modules').logic,
    BUNDLE_NAME = 'common';

module.exports = function() {
    return function(req, res, next) {
        var node, baseCtx, commonDataCtx, advancedDataCtx, ctx;

        try {
            node = logic.getNodeByRequest(req);
            baseCtx = {
                req: req,
                bundleName: BUNDLE_NAME,
                lang: req.prefLocale,
                statics: config.get('statics:www')
            };
            commonDataCtx = {
                node: node,
                title: logic.getTitleByNode(req, node),
                meta: logic.getMetaByNode(req, node),
                menu: logic.getMenuByNode(req, node),
                langSwitch: logic.getLangSwitchUrlByNode(req,node)
            };

            // console.log(JSON.stringify(commonDataCtx.menu, null, 4));

            advancedDataCtx = logic.getAdvancedData(req, node);

            ctx = _.extend({}, baseCtx, commonDataCtx, advancedDataCtx);

            return template.apply(ctx, req.prefLocale, req.query.__mode)
                .then(function(html) {
                    res.end(html);
                })
                .fail(function(err) {
                    next(err);
                });
        }catch(err) {
            return next(err);
        }
    };
};
