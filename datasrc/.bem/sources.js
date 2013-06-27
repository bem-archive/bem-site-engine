var BEM = require('bem'),
    registry = BEM.require('./nodesregistry'),
    // XXX: `./nodes/lib.js` доопределяет узлы из bem-tools
    libsNodes = require('./nodes/lib.js'),
//    cacherNodes = require('./nodes/cacher.js'),
    sourceNodes = require('./nodes/source.js');


//registry.decl(cacherNodes.CacherNodeName, {
//
//    sources : [
//        'bem-articles',
//        'bem-tools',
//        'islands-components',
//        'islands-core',
//        'islands-media',
//        'islands-page',
//        'islands-promo',
//        'islands-search',
//        'islands-services',
//        'islands-user'
//    ]
//
//});


registry.decl(sourceNodes.SourceNodeName, {

    getSets : function() {
        return {
            'islands-components' : {
                treeish : 'v1.20.0',
                paths : [
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'islands-page/common.blocks',
                    'islands-page/desktop.blocks',
                    'islands-search/common.blocks',
                    'islands-search/desktop.blocks',
                    'islands-user/common.blocks',
                    'islands-user/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-icons' : {
                treeish : 'v1.0.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-media' : {
                treeish : 'v1.0.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-page' : {
                treeish : 'v1.12.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'islands-components/common.blocks',
                    'islands-components/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-search/common.blocks',
                    'islands-search/desktop.blocks',
                    'islands-services/common.blocks',
                    'islands-services/desktop.blocks',
                    'islands-user/common.blocks',
                    'islands-user/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
//            'islands-promo' : {
//                treeish : 'dev',
//                paths : ['common.blocks', 'desktop.blocks'],
//                examplesLevels : [
//                    'bem-bl/blocks-common',
//                    'bem-bl/blocks-desktop',
//                    'bem-controls/common.blocks',
//                    'bem-controls/desktop.blocks',
//                    'islands-controls/common.blocks',
//                    'islands-controls/desktop.blocks',
//                    'lego/blocks-common',
//                    'lego/blocks-desktop',
//                    'common.blocks',
//                    'desktop.blocks'
//                ]
//            },
            'islands-search' : {
                treeish : 'v1.6.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'islands-controls/common.blocks',
                    'islands-popups/common.blocks',
                    'islands-popups/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-services' : {
                treeish : 'v1.3.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'islands-components/common.blocks',
                    'islands-components/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            },
            'islands-user' : {
                treeish : 'v1.13.0',
                paths : ['common.blocks', 'desktop.blocks'],
                examplesLevels : [
                    'bem-bl/blocks-common',
                    'bem-bl/blocks-desktop',
                    'bem-controls/common.blocks',
                    'bem-controls/desktop.blocks',
                    'lego/blocks-common',
                    'lego/blocks-desktop',
                    'islands-components/common.blocks',
                    'islands-components/desktop.blocks',
                    'islands-media/common.blocks',
                    'islands-media/desktop.blocks',
                    'islands-page/common.blocks',
                    'islands-page/desktop.blocks',
                    'common.blocks',
                    'desktop.blocks'
                ]
            }
        };
    }

});

// TODO: разобраться с npm-пакетами в библиотеках (Error: Cannot find module 'dom-js')

