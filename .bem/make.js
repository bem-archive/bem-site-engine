/* global MAKE */

require('./nodes');

var PATH = require('path'),
    LOGGER = require('bem/lib/logger'),
    environ = require('./environ');

try {
    require(environ.getLibPath('bem-core', '.bem/nodes/bundle.js'));
} catch(e) {
    // TODO: handle exception
    LOGGER.error(e);
}

MAKE.decl('Arch', {

    blocksLevelsRegexp : /^.+?\.blocks$/,

    bundlesLevelsRegexp : /^.+?\.bundles$/,

    libraries : [
        'bem-pr @ 0.0.5',
        'bem-gen-doc @ 0.4.0',
        // FIXME: LEGO-9684
        'bem-core @ 6974c09e1d04f122878ec4ce1b9215c0e6040c80',
        'bem-yana',
        // FIXME: romochka#feature/bem-core
        'romochka @ feature/bem-core',
        'bem-controls @ dev',
        'islands-controls @ dev',
        'islands-media @ v1.0.0',
        // FIXME: islands-page#feature/bem-core
        'islands-page @ feature/bem-core',
        'islands-services @ v1.0.0',
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
            // bem-bl + romochka
            'romochka/bem-bl/blocks-desktop',
            'romochka/blocks-common',
            'romochka/blocks-desktop',
            'romochka/intranet/blocks-desktop'
        ]
        .map(function(path) { return PATH.resolve(environ.LIB_ROOT, path) })
        .concat([
            'ycommon.blocks',
            'islands.blocks',
            'common.blocks',
            'desktop.blocks'
        ]
        .map(function(path) { return PATH.resolve(environ.PRJ_ROOT, path) }))
        .concat([PATH.resolve(this.root, PATH.dirname(this.getNodePrefix()), 'blocks')]);
    },

    'create-i18n.keys.js-node' : function(tech, bundleNode, magicNode) {
        return this.setBemCreateNode(
            tech,
            this.level.resolveTech(tech),
            bundleNode,
            magicNode);
    }

});
