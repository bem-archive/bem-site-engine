var _ = require('lodash'),
    template = require('../template'),
    config = require('../config'),
    logic = require('../modules').logic,
    BUNDLE_NAME = 'common';

/**
 * Middleware which performs all logic operations for request
 * fill the context and push it to templates stack
 * Finally returns html to response
 * @returns {Function}
 */
module.exports = function() {
    return function(req, res, next) {
        var node, baseCtx, commonDataCtx, advancedDataCtx, ctx;

        try {
            node = logic.getNodeByRequest(req);
            baseCtx = {
                req: req, //request object
                bundleName: BUNDLE_NAME,
                lang: req.prefLocale, //selected language
                statics: config.get('app:statics:www')
            };
            commonDataCtx = {
                node: node, //current node
                title: logic.getTitleByNode(req, node), //page title
                meta: logic.getMetaByNode(req, node), // page meta-information
                menu: logic.getMenuByNode(req, node), //menu structure
                langSwitch: logic.getLangSwitchUrlByNode(req,node) //url for lang switcher
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
