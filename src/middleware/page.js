var template = require('../template'),
    leLogic = require('../modules').leLogic,
    BUNDLE_NAME = 'common';

module.exports = function() {
    return function(req, res, next) {
        var node, ctx;

        try {
            node = leLogic.getNodeByRequest(req);
            ctx = {
                req: req,
                bundleName: BUNDLE_NAME,
                pageTitle: leLogic.getTitleByNode(req, node),
                meta: leLogic.getMetaByNode(req, node),
                menu: leLogic.getMenuByNode(req, node),
                node: node,
                lang: req.prefLocale
            };

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
