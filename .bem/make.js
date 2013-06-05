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
        // FIXME: LEGO-9684
        'bem-core @ 6974c09e1d04f122878ec4ce1b9215c0e6040c80',
        'bem-pr',
        'bem-gen-doc',
        'bem-yana @ unstable',
        // FIXME: romochka#feature/bem-core
        'romochka @ feature/bem-core',
        'bem-controls @ dev',
        'islands-controls @ dev',
        'islands-media @ dev',
        // FIXME: islands-page#feature/bem-core
        'islands-page @ feature/bem-core',
        'islands-search @ dev',
        'islands-services @ dev',
        // FIXME: islands-user#feature/bem-core
        'islands-user @ feature/bem-core'
    ]

});


MAKE.decl('BundleNode', {

    getTechs : function() {
        return [
            'bemdecl.js',
            'deps.js',
            'css',
            'ie9.css',
            'i18n',
            'i18n.keys.js',
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
    },

    'create-i18n.keys.js-node' : function(tech, bundleNode, magicNode) {
        return this.setBemCreateNode(
            tech,
            this.level.resolveTech(tech),
            bundleNode,
            magicNode);
    }

});
