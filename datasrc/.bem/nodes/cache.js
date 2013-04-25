var CRYPTO = require('crypto'),
    PATH = require('path'),
    BEM = require('bem'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    libNodes = BEM.require('./nodes/lib.js'),
    U = BEM.util;


var CacheNodeName = exports.CacheNodeName = 'CacheNode';
Object.defineProperty(exports, CacheNodeName, {
    get : function() { return registry.getNodeClass(CacheNodeName) }
});

registry.decl(CacheNodeName, nodes.NodeName, {

    __constructor : function(o) {
        this.__base.apply(this, arguments);

        this.arch = o.arch;
        this.root = o.root;

        this.cache = {};
    },

    pushToCache : function(lib) {
        // пропускаем библиотеки-симлинки, с ними не поянтно, что делать
        if(lib.type === 'symlink')
            return;

        var cachekey = this.getLibCacheKey(lib);
        if(this.cache[cachekey])
            return;

        var item = this.cache[cachekey] = lib,
            arch = this.arch,
            node = new (registry.getNodeClass(CacheItemNodeName))({
                root : this.root,
                item : item,
                cachekey : cachekey
            });

        arch.hasNode(node.getId()) ||
            arch.setNode(node, this);
    },

    getLibCacheKey : function(credential) {
        var shasum = CRYPTO.createHash('sha1'),
            key = [
                credential.url,
                credential.treesh || credential.branch || '-',
                credential.revision || '-'
            ].join('!');

        shasum.update(key, 'utf8');
        return shasum.digest('hex');
    }

}, {

    createId : function(o) {
        return o.id;
    }

});


var CacheItemNodeName = exports.CacheItemNodeName = 'CacheItemNode';
Object.defineProperty(exports, CacheItemNodeName, {
    get : function() { return registry.getNodeClass(CacheItemNodeName) }
});

registry.decl(CacheItemNodeName, nodes.NodeName, {

    __constructor : function(o) {
        this.__base.apply(this, arguments);

        this.root = o.root;
        this.item = o.item;
        this.cachekey = o.cachekey;
        this.path = PATH.join('.bem', 'cache', this.cachekey);
        this.bemDeps = o.item._bemDeps;
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx;
        return function() {
            var arch = ctx.arch,
                fakeLibNode = new nodes.Node(this.item._id),
                cacheLibNode = this.createLibNode();

            arch.setNode(fakeLibNode, arch.getParents(this));

            arch.hasNode(cacheLibNode.getId()) ||
                arch.setNode(cacheLibNode, fakeLibNode);
        }.bind(this);
    },

    createLibNode : function() {
        var target = this.path,
            lib = this.item,
            libNodeClass = U.toUpperCaseFirst(lib.type) + libNodes.LibraryNodeName;

        return new (registry.getNodeClass(libNodeClass))(U.extend({}, lib, {
                root   : this.root,
                target : target,
                npmPackages : false,    // FIXME: npmPackages
                bemDeps : this.bemDeps
            }));
    },

    getAbsolutePath : function() {
        return PATH.join(this.root, this.path);
    }

}, {

    createId : function(o) {
        return o.item._id + '*';
    }

});
