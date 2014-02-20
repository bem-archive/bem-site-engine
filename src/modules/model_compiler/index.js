var u = require('util'),
    path = require('path'),

    vow = require('vow'),
    fs = require('vow-fs'),
    _ = require('lodash'),
    sha = require('sha1'),

    logger = require('../../logger')(module),
    config = require('../../config'),
    util = require('../../util'),
    data = require('../data'),
    common = data.common

    docLoader = require('../doc_loader');

module.exports = {
    run: function() {
        logger.info('Model compiler start');

        try {
            var sitemap = require('../../../model').get();
            saveAndUploadSitemap(sitemap)
                .then(
                    function() {
                        logger.info('Save and upload sitemap successfully finished');
                        //return docLoader.run();
                    },
                    function(err) {
                        logger.error('Save and upload sitemap failed with error %s', err.message);
                    }
                );
        }catch(err) {
            logger.error('Model compiler failed with error %s', err.message);
        }
    }
};

var saveAndUploadSitemap = function(sitemap) {
    if ('production' === process.env.NODE_ENV) {
        return common.saveData(common.PROVIDER_YANDEX_DISK, {
            path: config.get('data:sitemap:disk'),
            data: JSON.stringify(sitemap, null, 4)
        });
    }else {
        return common.saveData(common.PROVIDER_FILE, {
            path: config.get('data:sitemap:file'),
            data: sitemap
        });
    }
};