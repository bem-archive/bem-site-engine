modules.define('bundles', function(provide) {
    var PATH = require('path'),
        LOD_DIR = 'bundles',
        LOD_SUFFIX = '.bundles';

    function Bundles(settings) {
        this._rootPath = (settings && settings.root) || '/';
        this._defaultLOD = (settings && settings.defaultLOD) || 'common';
    }

    Bundles.prototype.getBundlePath = function(name, LOD) {
        LOD || (LOD = this._defaultLOD);

        return PATH.join(this._rootPath, LOD_DIR, LOD + LOD_SUFFIX, name);
    };

    provide({
        Bundles: Bundles
    });
});
