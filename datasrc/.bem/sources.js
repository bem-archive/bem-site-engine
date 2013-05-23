var PATH = require('path'),
    BEM = require('bem'),
    registry = BEM.require('./nodesregistry'),
    libsNodes = require('./nodes/lib.js'),
    cacherNodes = require('./nodes/cacher.js'),
    sourceNodes = require('./nodes/source.js'),
    PRJ_ROOT = PATH.resolve(__dirname, '../../');

process.env.__root_level_dir = PRJ_ROOT;


registry.decl(cacherNodes.CacherNodeName, {

    sources : [
//        'bem-articles',
//        'bem-tools',
        'islands-controls',
        'islands-core',
        'islands-dynamic',
        'islands-islands',
        'islands-media',
        'islands-page',
        'islands-popups',
        'islands-search',
        'islands-services',
        'islands-user'
    ]

});


registry.decl(sourceNodes.SourceNodeName, {

    getSets : function() {
        return {
//            'bem-tools' : {
//                blocks : ['docs']
//            },
//            'bem-articles' : {
//                blocks : ['.']
//            },
              // TODO: Error: Tech module with path
              // '/home/varankinv/web/vendor/bem-bl/blocks-common/i-bem/bem/techs/bemhtml.js'
              // not found on require search paths
            /*'islands-controls' : {
                paths : [
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },*/
            'islands-dynamic' : {
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'lego/blocks-common',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-media' : {
                paths : ['common.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'islands-controls/common.blocks',
                    'islands-controls/desktop.blocks',
                    'islands-popups/common.blocks',
                    'islands-popups/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-page' : {
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'islands-controls/common.blocks',
                    'islands-controls/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-user/common.blocks',
                    'islands-user/desktop.blocks',
                    'islands-popups/common.blocks',
                    'islands-popups/desktop.blocks',
                    'islands-services/common.blocks',
                    'islands-services/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-popups' : {
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'islands-controls/common.blocks',
                    'islands-controls/desktop.blocks',
                    'islands-page/common.blocks',
                    'islands-page/desktop.blocks',
                    'islands-search/common.blocks',
                    'islands-search/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-user/common.blocks',
                    'islands-user/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-services' : {
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-page/common.blocks',
                    'islands-page/desktop.blocks',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'islands-controls/common.blocks',
                    'islands-controls/desktop.blocks',
                    'islands-popups/common.blocks',
                    'islands-popups/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-user' : {
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-page/common.blocks',
                    'islands-page/desktop.blocks',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'islands-controls/common.blocks',
                    'islands-controls/desktop.blocks',
                    'islands-popups/common.blocks',
                    'islands-popups/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            }
        };
    }

});

// TODO: разобраться с npm-пакетами в библиотеках (Error: Cannot find module 'dom-js')
// FIXME: "Error: channel closed" во время сборки примеров

