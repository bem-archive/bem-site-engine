var Vow = require('vow'),
    config = require('../config'),
    template = require('../template'),
    leData = require('../le-data'),
    Statics = require('../../lib/Statics').Statics,
    Bundles = require('../../lib/Bundles').Bundles,
    BUNDLE_NAME = 'common';

module.exports = function() {

    return function(req, res) {
        var ctx = {
            req: req,
            bundleName: BUNDLE_NAME,
            datasrc: leData.getDataFromCache()
        };

        template.I18N.lang(req.prefLocale);

        return template.apply(ctx, req.query['__mode'])
            .then(function(html) {
                res.end(html);
            });
    }
};
