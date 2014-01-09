var vowFs = require('vow-fs'),
    logger = require('./logger')(module);

exports.createDirectory = function(dirName) {
    return vowFs.makeDir(dirName, false).fail(function(err) {
        logger.error('%s directory creation failed with error', dirName, err.message);
    });
};
