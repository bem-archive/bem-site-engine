var template = require('../template'),
    logic = require('../modules').logic,
    BUNDLE_NAME = 'common';

module.exports = function() {
    return function(req, res, next) {
        var node, ctx;

        try {
            node = logic.getNodeByRequest(req);
            ctx = {
                req: req,
                bundleName: BUNDLE_NAME,
                pageTitle: logic.getTitleByNode(req, node),
                meta: logic.getMetaByNode(req, node),
                menu: logic.getMenuByNode(req, node),
                node: node,
                lang: req.prefLocale
            };

            logic.getNodesBySourceCriteria('ru', ['authors', 'translators'], 'androsov-alexey');

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
