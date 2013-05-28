var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    LOGGER = BEM.require('./logger.js'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    cacherNodes = require('./cacher.js'),
//    cacheNodes = require('./cache.js'),
    introspectorNodes = require('./introspector.js'),
    examplerNodes = require('./exampler.js'),
    pageNodes = require('./page.js'),

    PRJ_ROOT = PATH.resolve(__dirname, '../../../'),
    environ = require(PATH.join(PRJ_ROOT, '.bem/environ.js')),
    outputNodes = require(environ.getLibPath('bem-gen-doc', '.bem/nodes/output.js')),

    U = BEM.util,
    SOURCE_NODEID = exports.SOURCE_NODEID = 'sources';


var SourceNodeName = exports.SourceNodeName = 'SourceNode';
Object.defineProperty(exports, SourceNodeName, {
    get : function() { return registry.getNodeClass(SourceNodeName) }
});

registry.decl(SourceNodeName, {

    __constructor : function(o) {
        this.root = o.root;
        this.arch = o.arch;
    },

    alterArch : function() {
        var arch = this.arch;

        if(!arch.hasNode(cacherNodes.CACHE_NODEID)) {
            return Q.resolve(1);
        }

        var source = this.createSourceNode(),
            cache = arch.getNode(cacherNodes.CACHE_NODEID);

        var sets = this.getSets();
        return Q.all(Object.keys(sets).map(function(lib) {
                var sources = sets[lib];

                if(U.isEmptyObject(sources)) {
                    LOGGER.warn('Source declaration for library "' + lib + '" is not specified. Skipping');
                    return;
                }

                cache.pushToCache(lib);

                var item = new (registry.getNodeClass(SourceItemNodeName))({
                        root : this.root,
                        item : cache.getCredentials(lib),
                        sources : sources
                    });

                return arch.setNode(item, source);
            }, this))
            .thenResolve(arch);
    },

    createSourceNode : function() {
        var node = new nodes.Node(SOURCE_NODEID);
        this.arch.setNode(node);
        return node;
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
        this.sources = o.sources;

        this._decl = [];
        this._cacheItemNode = null;

        this.path = this.__self.createNodePath(o);
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

            return Q.all([this.createPageNode(), this.createExamplerNode()])
                .spread(function(page, exampler) {
                    return [
                        page,
                        exampler,
                        Q.fcall(_t.createIntrospectorNode.bind(_t), null, _t._cacheItemNode.getId())
                    ];
                })
                .spread(function(page, exampler, spectr) {
                    return Q.fcall(_t.createPageItemNode.bind(_t), page, spectr);
                })
                .thenResolve(_t.ctx.arch);
        };
    },

    getOrCreateRealSourceItemNode : function() {
        var arch = this.ctx.arch,
            id = this.path,
            node;

        if(arch.hasNode(id)) {
            node = arch.getNode(id);
        } else {
            node = new nodes.Node(this.path);
            arch.setNode(node, arch.getParents(this), this._cacheItemNode.getId());
        }

        return node;
    },

    createPageNode : function() {
        var ctx = this.ctx,
            arch = ctx.arch,
            pageNode = new pageNodes.PageNode({
                root : this.root,
                item : this.item,
                path : this.path
            }),
            realSINode = this.getOrCreateRealSourceItemNode();

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

                    return arch.setNode(piNode, parent, child);
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
                sources : this.sources.paths
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
                this._decl = U.extend({}, decl);

                var spectrItemNode = new introspectorNodes.IntrospectorItemNode({
                    root : this.root,
                    path : item._id,
                    decl : decl
                });

                arch.setNode(spectrItemNode, parent, child);

                return spectrItemNode;
            }.bind(this));
    },

    createExamplerNode : function() {
        var arch = this.ctx.arch,
            sources = this.sources,
            libRoot = this._cacheItemNode.getPath(),
            examplerNode = new examplerNodes.ExamplerNode({
                root : this.root,
                path : this.path,
                libRoot : libRoot,
                sources : sources.paths,
                levels  : sources.examplesLevels
            }),
            realSINode = this.getOrCreateRealSourceItemNode();

        arch.setNode(examplerNode, realSINode, this._cacheItemNode.getId());

        return examplerNode;
    }

}, {

    createId : function(o) {
        return this.createNodePath(o) + '*';
    },

    createNodePath : function(o) {
        return '_' + o.item._id;
    }

});
