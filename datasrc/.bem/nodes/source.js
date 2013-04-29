var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    cacheNodes = require('./cache.js'),
    introspectorNodes = require('./introspector.js'),
    pageNodes = require('./page.js'),

    PRJ_ROOT = PATH.resolve(__dirname, '../../../'),
    environ = require(PATH.join(PRJ_ROOT, '.bem/environ.js')),
    outputNodes = require(environ.getLibPath('bem-gen-doc', '.bem/nodes/output.js')),

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
        this.path = '_' + o.item._id;

        this._decl = [];
        this._cacheItemNode = null;
    },

    getPath : function() {
        return PATH.join(this.root, this.path);
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var _t = this,
            ctx = this.ctx;

        return function() {
            var arch = ctx.arch,
                item = this.item;

            _t._cacheItemNode = arch.getNode(item._id + '*');    // FIXME: hardcode

            return Q.when(this.createPageNode())
                .then(function(page) {
                    return [
                        page,
                        Q.fcall(this.createIntrospectorNode.bind(this), null, this._cacheItemNode.getId())
                    ];
                }.bind(this))
                .spread(function(page, spectr) {
                    return Q.when(this.createPageItemNode(page, spectr));
                }.bind(this))
                .then(function() {
                    return _t.ctx.arch;
                });
        };
    },

    createPageNode : function() {
        var ctx = this.ctx,
            arch = ctx.arch,
            pageNode = new pageNodes.PageNode({
                root : this.root,
                item : this.item,
                path : this.path
            }),
            realSINode = new nodes.Node(this.path);

        arch.setNode(realSINode, arch.getParents(this), this._cacheItemNode.getId());
        arch.setNode(pageNode, realSINode);

        return pageNode;
    },

    createPageItemNode : function(parent, child) {
        var arch = this.ctx.arch,
            decl = this._decl,

            // FIXME: ugly!
            root = this._cacheItemNode.getPath(),
            itemNode = new outputNodes.CatalogueItemNode({
                root : root,
                level : '',
                item : { block : this.item._id },
                techName : 'json.js'
            });

        return Q.all(Object.keys(decl).map(function(block) {
            return Q.fcall(itemNode.translateMeta.bind(itemNode), decl[block])
                .then(function(data) {
                    var piNode = new pageNodes.PageItemNode({
                        root : this.root,
                        data : data,
                        path : PATH.join(parent.path, block)
                    });

                    arch.setNode(piNode, parent, child);

                    return piNode;
                }.bind(this));
        }, this));
    },

    createIntrospectorNode : function(parent, child) {
        var arch = this.ctx.arch,
            root = this._cacheItemNode.getPath(),
            spectrNode = new introspectorNodes.IntrospectorNode({
                root : this.root,
                item : this.item,
                libRoot : root,
                sources : ['common.blocks']     // FIXME: hardcode
            });

//        parent = arch.getNode(this.path);
//
//        arch.setNode(spectrNode, parent, child);
//        // FIXME: ugly!
//        spectrNode._sourceItemNode = this;
//
//        return spectrNode;

        var item = this.item;
        return spectrNode.getStruct()
            .then(function(decl) {
                this._decl = decl;

                var spectrItemNode = new introspectorNodes.IntrospectorItemNode({
                    root : this.root,
                    path : item._id,
                    decl : decl
                });

                arch.setNode(spectrItemNode, parent, child);

                return spectrItemNode;
            }.bind(this));
    }

}, {

    createId : function(o) {
        return '_' + o.item._id + '*';
    }

});
