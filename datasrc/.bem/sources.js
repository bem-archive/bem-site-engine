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
        'bem-articles',
        'bem-tools',
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
            'islands-popups' : {
                blocks : ['common.blocks', 'desktop.blocks']
            }
        };
    }

});

// TODO: разобраться с npm-пакетами в библиотеках (Error: Cannot find module 'dom-js')
