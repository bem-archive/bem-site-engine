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
// TODO: унести в отдельный узел (нужна зависимость spectrItemNode -> outputNodes)
/*
registry.decl(sourceNodes.SourceItemNodeName, {

    createIntrospectorNode : function() {
        return this.__base.apply(this, arguments)
            .then(function(spectrItemNode) {
                var outputNodes = require(PATH.join(BGD_ROOT, '.bem/nodes/output.js')),
                    cacheItemNode = this.ctx.arch.getNode(this.item._id + '*'),
                    itemNode = new outputNodes.CatalogueItemNode({
                        root : cacheItemNode.getPath(), // XXX: note `path`!
                        level : '',
                        item : { block : 'islands-popups' },
                        techName : 'data.json'
                    }),
                    blockPath = PATH.join(this.getPath(), 'blocks');
                return QFS.makeTree(blockPath)
                    .invoke.call(spectrItemNode, 'readDecl')
                    .then(function(decl) {

                        return Q.all(Object.keys(decl).map(function(block) {
                            return this.translateMeta(decl[block])
                                .then(function(data) {
                                    var path = PATH.join(blockPath, [block, 'json.js'].join('.'));
                                    return U.writeFileIfDiffers(path, JSON.stringify(data, null, 2));
                                });
                        }, this));

                    }.bind(itemNode));

            }.bind(this));
    }

});
*/