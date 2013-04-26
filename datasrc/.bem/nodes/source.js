var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    cacheNodes = require('./cache.js'),
    introspectorNodes = require('./introspector.js'),

    PRJ_ROOT = PATH.resolve(__dirname, '../../../'),
    environ = require(PATH.join(PRJ_ROOT, '.bem/environ.js')),

    CACHE_NODEID = exports.CACHE_NODEID = 'cache',
    SOURCE_NODEID = exports.SOURCE_NODEID = 'sources';


var SourceNodeName = exports.SourceNodeName = 'SourceNode';
Object.defineProperty(exports, SourceNodeName, {
    get : function() { return registry.getNodeClass(SourceNodeName) }
});

registry.decl(SourceNodeName, {

    __constructor : function(o) {
        this.arch = o.arch;
        this.root = o.root;
    },

    alterArch : function() {
        var cacheNode = this.createCacheNode(),
            sourceNode = this.createSourcesNode();

        return Q.all(this.getLibraries().map(function(id) {
                var lib = this.getLibCredentials(id);
                cacheNode.pushToCache(lib);

                var itemNode = new (registry.getNodeClass(SourceItemNodeName))({
                        root : this.root,
                        item : lib
                    });
                this.arch.setNode(itemNode, sourceNode);
            }, this))
            .then(function() {
                return this.arch;
            }.bind(this));
    },

    createCacheNode : function() {
        var node = new cacheNodes.CacheNode({
                id   : CACHE_NODEID,
                arch : this.arch,
                root : this.root
            });
        this.arch.setNode(node);
        return node;
    },

    createSourcesNode : function() {
        var node = new nodes.Node(SOURCE_NODEID);
        this.arch.setNode(node);
        return node;
    },

    getLibraries : function() {
        return [];
    },

    getLibCredentials : function(lib) {
        var id = PATH.basename(lib),
            credential = environ.getConf().libraries[id];

        if(credential == null) {
            throw new Error('Library "' + id + '" (' + lib + ') is not registered!');
        }

        credential._id = id;
        credential._bemDeps = true;

        return credential;
    }

});


var SourceItemNodeName = exports.SourceItemNodeName = 'SourceItemNode';
Object.defineProperty(exports, SourceItemNodeName, {
    get : function() { return registry.getNodeClass(SourceItemNodeName) }
});

registry.decl(SourceItemNodeName, nodes.NodeName, {

    __constructor : function(o) {
        this.__base(o);
        this.root = o.root;
        this.item = o.item;
        this.path = '_' + o.item.id;
    },

    getPath : function() {
        return PATH.join(this.root, this.path);
    },

    make : function() {
        return this.ctx.arch.withLock(this.createIntrospectorNode(), this);
    },

    createIntrospectorNode : function() {
        var ctx = this.ctx;
        return function() {
            var arch = ctx.arch,
                lib = this.item,
                cacheItemNode = ctx.arch.getNode(lib._id + '*'),    // FIXME: hardcode
                spectrNode = new introspectorNodes.IntrospectorNode({
                    id : lib._id + '-spectr',
                    root : cacheItemNode.getPath(),
                    sources : ['common.blocks']     // FIXME: hardcode
                }),
                realSINode = new nodes.Node(this.path);

            arch.setNode(realSINode, arch.getParents(this));

            return spectrNode.getStruct()
                .then(function(decl) {
                    var spectrItemNode = new introspectorNodes.IntrospectorItemNode({
                        root : this.root,
                        path : lib._id,
                        decl : decl
                    });

                    arch.setNode(spectrItemNode, realSINode, cacheItemNode.getId());

                    return spectrItemNode;
                }.bind(this));
        };
    }

}, {

    createId : function(o) {
        return '_' + o.item._id + '*';
    }

});
