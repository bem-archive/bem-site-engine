var PATH = require('path'),
    CP = require('child_process'),
    VM = require('vm'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    libNodes = BEM.require('./nodes/lib.js'),
    cacheNodes = require('./cache.js'),
    sourceNodes = require('./source.js');


var LibraryNodeName = libNodes.LibraryNodeName;
Object.defineProperty(exports, LibraryNodeName, {
    get : function() { return registry.getNodeClass(LibraryNodeName) }
});

registry.decl(LibraryNodeName, {

    /**
     * @override
     */
    __constructor : function(o) {
        this.__base.apply(this, arguments);
        this.bemDeps = o.bemDeps;
    },

    /**
     * @override
     */
    installLibraryDependencies : function() {
        var base = this.__base.bind(this, arguments);
        return Q.when(this.getBemDependensies(),
            function(libs) {
                if(!libs || Array.isArray(libs)) {
                    return;
                }
                return this.addBemDependencies(libs);
            }.bind(this))
            .fin(function() {
                return base();
            });
    },

    getBemDependensies : function() {
        if(!this.bemDeps)
            return;

        var defer = Q.defer(),
            root = this.getPath(),
            worker = CP.fork(PATH.join(__dirname, 'workers', 'bemdeps.js'), null, {
                cwd : root,
                env : { __root_level_dir : '' }
            });

        worker.once('message', function(m) {
            worker.kill();

            if(m.code === 0 || m.root === root)
                return defer.resolve(m.deps);

            defer.reject(m.msg);
        });

        worker.send({ root : root });

        return defer.promise;
    },

    addBemDependencies : function(deps) {
        var arch = this.ctx.arch;
        if(!arch.hasNode(sourceNodes.CACHE_NODEID))
            return;

        var CacheNode = arch.getNode(sourceNodes.CACHE_NODEID),
            CacheItemNode = registry.getNodeClass(cacheNodes.CacheItemNodeName);

        return Q.all(Object.keys(deps).map(function(lib) {
            var id = PATH.basename(lib),
                item = deps[lib];

            item._id = id;

            CacheNode.pushToCache(item);

            var cacheiid = CacheItemNode.createId({ item : item });
            if(arch.hasNode(cacheiid)) {
                var cacheItemNode = arch.getNode(cacheiid);
                arch.addParents(cacheItemNode, arch.getParents(this));

                var depNode = new libNodes.SymlinkLibraryNode({
                        root : this.getPath(),
                        target : lib,
                        relative : PATH.relative(this.getPath(), cacheItemNode.getPath()),
                        npmPackages : false
                    });

                depNode.id = PATH.join(this.id, depNode.id);

                arch.setNode(depNode, arch.getParents(this));
            }
        }, this));
    }

});
