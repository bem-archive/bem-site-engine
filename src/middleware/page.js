var template = require('../template'),
    leLogic = require('../le-modules').leLogic,
    BUNDLE_NAME = 'common';

module.exports = function() {
    return function(req, res, next) {

        var node = leLogic.getNodeByRequest(req),
            ctx = {
                req: req,
                bundleName: BUNDLE_NAME,
                pageTitle: leLogic.getTitleByNode(req, node),
                meta: leLogic.getMetaByNode(req, node),
                node: node
            };

        return template.apply(ctx, req.prefLocale, req.query.__mode)
            .then(function(html) {
                res.end(html);
            })
            .fail(function(err) {
                next(err);
            });
    };
};
