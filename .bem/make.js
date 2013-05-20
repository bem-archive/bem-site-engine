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
        'romochka @ 2.10.12',
        'bem-controls',
        'islands-controls',
        'islands-media',
        'islands-page @ dev',   // FIXME: dev
        'islands-search',
        'islands-services',
        'islands-user @ dev'    // FIXME: islands-user#dev
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

    getOptimizerTechs : function() {
        return [
            'css',
            'ie9.css',
            'browser.js',
            'node.js'
        ];
    },

    getLevels : function() {
        return [
            // bem-core
            'bem-core/common.blocks',
            // bem-yana
            'bem-yana/common.blocks',
            'bem-yana/app.blocks',
            // bem-controls
            'bem-controls/common.blocks',
            'bem-controls/desktop.blocks',
            // islands-controls
            'islands-controls/common.blocks',
            'islands-controls/desktop.blocks',
            // islands-media
            'islands-media/common.blocks',
            // islands-page
            'islands-page/common.blocks',
            'islands-page/desktop.blocks',
            // islands-user
            'islands-user/common.blocks',
            'islands-user/desktop.blocks',
            // islands-services
            'islands-services/common.blocks',
            'islands-services/desktop.blocks',
            // islands-search
            'islands-search/common.blocks',
            'islands-search/desktop.blocks',
            // bem-bl + romochka
            'romochka/bem-bl/blocks-desktop',
            'romochka/blocks-common',
            'romochka/blocks-desktop'
        ]
        .map(function(path) { return PATH.resolve(environ.LIB_ROOT, path) })
        .concat([
            'ycommon.blocks',
            'islands.blocks',
            'common.blocks',
            'desktop.blocks',
            'configs/current'
        ]
        .map(function(path) { return PATH.resolve(environ.PRJ_ROOT, path) }));
    }

});
