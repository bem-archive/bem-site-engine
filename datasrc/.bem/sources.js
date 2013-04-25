var PATH = require('path'),
    BEM = require('bem'),
    registry = BEM.require('./nodesregistry.js'),

    cacheNodes = require('./nodes/cache.js'),
    libNodes = require('./nodes/lib.js'),
    sourceNodes = require('./nodes/source.js'),

    PRJ_ROOT = PATH.resolve(__dirname, '../../');

process.env.__root_level_dir = PRJ_ROOT;


registry.decl(sourceNodes.SourceNodeName, {

    getLibraries : function() {
        return [
            'islands-controls',
            'islands-popups',
            'islands-user',
            'islands-media'
        ];
    }

});
