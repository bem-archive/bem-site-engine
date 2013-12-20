var Vow = require('vow'),
    config = require('../config'),
    template = require('../template'),
    leData = require('../le-data'),
    leJsPath = require('../le-jspath'),
    leLogic = require('../le-logic'),
    Statics = require('../../lib/Statics').Statics,
    Bundles = require('../../lib/Bundles').Bundles,
    BUNDLE_NAME = 'common';

module.exports = function() {

    return function(req, res) {
        return leData.getData()
            .then(function(data) {
                leJsPath.setSource(data);
                var ctx = {
                    req: req,
                    bundleName: BUNDLE_NAME,
                    datasrc: data
                };

                template.I18N.lang(req.prefLocale);

                return template.apply(ctx, req.query['__mode'])
                    .then(function(html) {
                        res.end(html);
                    });
            });
    }
};
