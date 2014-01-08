var Vow = require('vow'),
    config = require('../config'),
    logger = require('../logger')(module),
    template = require('../template'),
    leData = require('../le-data'),
    BUNDLE_NAME = 'common';

module.exports = function() {

    return function(req, res) {
        logger.debug('middleware execute for url %s', req._parsedUrl.path);

        var ctx = {
            req: req,
            bundleName: BUNDLE_NAME,
            datasrc: leData.getDataFromCache()
        };

        return template.apply(ctx, req.prefLocale, req.query['__mode'])
            .then(function(html) {
                res.end(html);
            });
    }
};
