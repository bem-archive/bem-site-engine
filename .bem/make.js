/* global MAKE */

var PATH = require('path'),
    LOGGER = require('bem/lib/logger')
    environ = require('bem-environ')(__dirname);

environ.extendMake(MAKE);

try {
    require(environ.getLibPath('bem-core', '.bem/nodes/bundle.js'));
} catch(e) {
    // TODO: handle exception
    LOGGER.error(e);
}

MAKE.decl('Arch', {

    blocksLevelsRegexp : /^.+?\.blocks$/,
    bundlesLevelsRegexp : /^.+?\.bundles$/,

    // getLibraries : function() {
    //     return this.__base();
    // }

    libraries : [
        'bem-yana',
        'bem-core @ 8981332a71',
        'bem-ycommon @ v2',
        'bem-components @ v2',

        'islands-components @ v2',
        'islands-media @ v1.0.0',
        'islands-page @ feature/bem-core',
        'islands-services @ v1.0.0',
        'islands-user @ feature/bem-core',

        'romochka @ feature/bem-core'
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
            'bemtree',
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

            // bem-ycommon
            'bem-ycommon/ycommon.blocks',
            'bem-ycommon/common.blocks',

            // bem-components
            'bem-components/common.blocks',
            'bem-components/desktop.blocks',

            // islands-components
            'islands-components/common.blocks',
            'islands-components/desktop.blocks',

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
