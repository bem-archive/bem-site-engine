var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    registry = BEM.require('./nodesregistry.js'),
    cacheNodes = require('./cache.js'),

    PRJ_ROOT = PATH.resolve(__dirname, '../../../'),
    environ = require(PATH.join(PRJ_ROOT, '.bem/environ.js')),

    CACHE_NODEID = exports.CACHE_NODEID = 'cache';


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
        var cacheNode = this.createCacheNode();

        return Q.all(this.getLibraries().map(function(id) {
                var lib = this.getLibCredentials(id);
                cacheNode.pushToCache(lib);
            }, this))
            .then(function() {
                return this.arch;
            }.bind(this));
    },

    createCacheNode : function() {
        var node = new (registry.getNodeClass(cacheNodes.CacheNodeName))({
                id   : CACHE_NODEID,
                arch : this.arch,
                root : this.root
            });
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
