var PATH = require('path'),
    LOD_SUFFIX = '.bundles'; //Суффикс уровня переопределения

var Bundles = function(settings) {
    this._rootPath = (settings && settings.root) || '/';
    this._defaultLOD = (settings && settings.defaultLOD) || 'common';
};

Bundles.prototype.getBundlePath = function(name, LOD) {
    LOD || (LOD = this._defaultLOD);

    return PATH.join(this._rootPath, LOD + LOD_SUFFIX, name);
};

exports.Bundles = Bundles;