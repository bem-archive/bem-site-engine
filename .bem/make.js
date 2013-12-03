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
        'bem-core @ 8981332a71',
        'bem-components @ v2'
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

            // bem-components
            'bem-components/common.blocks',
            'bem-components/desktop.blocks'
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
