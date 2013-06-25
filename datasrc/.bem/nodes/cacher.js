var BEM = require('bem'),
    Q = BEM.require('q'),
    registry = BEM.require('./nodesregistry.js'),
    cacheNodes = require('./cache.js'),

    CACHE_NODEID = exports.CACHE_NODEID = 'cache';


var CacherNodeName = exports.CacherNodeName = 'CacherNode';
Object.defineProperty(exports, CacherNodeName, {
    get : function() { return registry.getNodeClass(CacherNodeName) }
});

registry.decl(CacherNodeName, {

    __constructor : function(o) {
        this.arch = o.arch;
        this.root = o.root;

        this._cache = null;
    },

    sources : [],

    alterArch : function() {
        return Q.when(this.createCacheNode())
            .then(function(cache) {
                var libs = this.getSources();
                return Q.all(libs.map(this.push, this));
            }.bind(this))
            .get.call(this, 'arch');
    },

    createCacheNode : function() {
        var node;

        if(this.arch.hasNode(CACHE_NODEID)) {
            node = this.arch.getNode(CACHE_NODEID);
        } else {
            node = new cacheNodes.CacheNode({
                id   : CACHE_NODEID,
                arch : this.arch,
                root : this.root
            });
            this.arch.setNode(node);
        }

        return this._cache = node;
    },

    push : function(id) {
        return this._cache.pushToCache(id);
    },

    getSources : function() {
        return this.sources;
    }

});