var Vow = require('vow'),
    config = require('../config'),
    template = require('../template'),
    leData = require('../le-data'),
    BUNDLE_NAME = 'common';

module.exports = function() {

    return function(req, res) {
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
