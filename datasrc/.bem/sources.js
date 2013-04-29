var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),

    registry = BEM.require('./nodesregistry.js'),

    cacheNodes = require('./nodes/cache.js'),
    libNodes = require('./nodes/lib.js'),
    sourceNodes = require('./nodes/source.js');

    U = BEM.util,
    PRJ_ROOT = PATH.resolve(__dirname, '../../');

process.env.__root_level_dir = PRJ_ROOT;
var environ = require('../../.bem/environ'),
    BGD_ROOT = environ.getLibPath('bem-gen-doc');


registry.decl(sourceNodes.SourceNodeName, {

    getLibraries : function() {
        return [
//            'islands-controls',
            'islands-popups',
            'islands-user',
            'islands-media'
        ];
    }

});

// TODO: разобраться с npm-пакетами в библиотеках (Error: Cannot find module 'dom-js')
