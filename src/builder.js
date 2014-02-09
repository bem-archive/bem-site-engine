var path = require('path'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    enbBuilder = require('enb/lib/server/server-middleware').createBuilder({ cdir: path.join(__dirname, '..') }),
    dropRequireCache = require('enb/lib/fs/drop-require-cache');

function build(targets, process) {
    return vow.all(
        targets.map(function (target) {
            return enbBuilder(target)
                .then(process);
        })
    );
}

function buildAndRequire(targets) {
    return build(targets, function(fullpath) {
        return vfs.read(fullpath);
    });
}

exports.build = function(target) {
    return build(target);
};

exports.buildAndRequire = buildAndRequire;
