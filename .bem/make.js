/* global MAKE:false */

require('./nodes');

var PATH = require('path'),
    environ = require('./environ');

try {
    require(environ.getLibPath('bem-core', '.bem/nodes/bundle.js'));
    require(environ.getLibPath('bem-yana-stub', '.bem/nodes/bundle.js'));
} catch (e) {
    // TODO: handle exception
}

MAKE.decl('Arch', {

    blocksLevelsRegexp : /^.+?\.blocks$/,

    bundlesLevelsRegexp : /^.+?\.bundles$/,

    libraries : [
        'bem-core @ feature/modules',
        'bem-pr',
        'bem-gen-doc',
        'bem-yana @ unstable',
        'bem-yana-stub',
        'romochka @ 2.10.11'
    ]

});


MAKE.decl('BundleNode', {

    getTechs : function() {
        return [
            'bemdecl.js',
            'deps.js',
            'css',
            'ie9.css',
            'bemhtml',
            'bemtree.xjst',
            'browser.js',
            'node.js'
        ];
    },

    getLevels : function() {
        return [
                'bem-core/common.blocks',
                'bem-yana/common.blocks',
                'bem-yana/app.blocks',
                'bem-yana-stub/common.blocks',
                'islands-user/common.blocks',
                'islands-user/desktop.blocks'
            ]
            .map(function(path) { return PATH.resolve(environ.LIB_ROOT, path); })
            .concat([
                'common.blocks',
                'ycommon.blocks',
                'desktop.blocks',
                'configs/current'
            ]
            .map(function(path) { return PATH.resolve(environ.PRJ_ROOT, path); }));
    }

});
