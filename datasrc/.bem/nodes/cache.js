var CRYPTO = require('crypto'),
    PATH = require('path'),
    BEM = require('bem'),
    QFS = BEM.require('q-fs'),
    LOGGER = BEM.require('./logger.js'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    libNodes = BEM.require('./nodes/lib.js'),
    repo = require('legoa-repodb'),
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
        lib = this.getCredentials(lib);

        // пропускаем библиотеки-симлинки, с ними не поянтно, что делать
        if(lib.type === 'symlink') {
            LOGGER.info('Cache: skip symlink library "' + lib.relative + '"');
            return;
        }

        // явно просим выгружать зависимые библиотеки если не сказано обратное
        if(lib.bemDeps !== false) {
            LOGGER.fdebug('Should load BEM-dependencies for %j', lib);
            lib.bemDeps = true;
        }

        var cachekey = this.getCacheKey(lib);
        if(this.cache[cachekey]) {
            LOGGER.fdebug('Library "%s" (cache key: "%s") is already cached, skip', lib.url, cachekey);
            return;
        }

        this.cache[cachekey] = lib;

        var arch = this.arch,
            CacheItemNode = registry.getNodeClass(CacheItemNodeName);

        if(!arch.hasNode(CacheItemNode.createId({ item : lib }))) {
            LOGGER.fdebug('Pushing library %j (cache key "%s") to cache', lib, cachekey);

            var node = new CacheItemNode({
                root : this.root,
                item : lib,
                cachekey : cachekey
            });

            arch.setNode(node, this);
        }
    },

    getCacheKey : function(credential) {
        var shasum = CRYPTO.createHash('sha1'),
            key = [
                credential.url,
                credential.treeish || credential.branch || '-',
                credential.revision || '-'
            ].join('\00');

        shasum.update(key, 'utf8');

        return shasum.digest('hex');
    },

    getCredentials : function(lib) {
        if(typeof lib === 'object') {
            return lib;
        }

        var id = PATH.basename(lib),
            credential = repo[id];

        if(credential == null) {
            throw new Error('Library "' + id + '" (' + lib + ') is not registered!');
        }

        return credential;
    }

}, {

    createId : function(o) {
        return o.id;
    }

});


// TODO
//var CacheMetaNodeName = exports.CacheMetaNodeName = 'CacheMetaNode';
//Object.defineProperty(exports, CacheMetaNodeName, {
//    get : function() { return registry.getNodeClass(CacheMetaNodeName) }
//});
//
//registry.decl(CacheMetaNodeName, {});


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
        this.bemDeps = o.item.bemDeps;

        this.path = this.__self.createNodePath(this);
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx;
        return function() {
            var arch = ctx.arch,
                metaNode = this.createMetaNode(),
                cacheLibNode;

            if(arch.hasNode(this.path)) {
                cacheLibNode = arch.getNode(this.path);
            } else {
                cacheLibNode = this.createLibNode();
                arch.setNode(cacheLibNode, metaNode);
            }
        }.bind(this);
    },

    createMetaNode : function() {
        var arch = this.ctx.arch,
            NodeClass = registry.getNodeClass(CacheItemMetaNodeName),
            opts = {
                root : this.root,
                item : this.item,
                cachekey : this.cachekey
            },
            nodeid = NodeClass.createId(opts);

        if(arch.hasNode(nodeid)) {
            return arch.getNode(nodeid);
        }

        var metaNode = new NodeClass(opts);
        arch.setNode(metaNode, arch.getParents(this));

        return metaNode;
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

    getPath : function() {
        return PATH.join(this.root, this.path);
    }

}, {

    createId : function(o) {
        return this.createNodePrefix(o.item) + '*';
    },

    createNodePrefix : function(item) {
        var suffix = '';

        /**
         * NOTE: CacheItemNode не создается для библиотек `type=symlink`,
         * поэтому их не учитываем
         */
        switch(item.type) {

        case 'git':
            suffix = item.treeish || item.branch || 'master';
            break;

        case 'svn':
            suffix = item.revision;
            break;

        }

        return item.url + '#' + suffix;
    },

    createNodePath : function(o) {
        return PATH.join('.bem', 'cache', o.cachekey);
    }

});


var CacheItemMetaNodeName = exports.CacheItemMetaNodeName = 'CacheItemMetaNode';
Object.defineProperty(exports, CacheItemMetaNodeName, {
    get : function() { return registry.getNodeClass(CacheItemMetaNodeName) }
});

registry.decl(CacheItemMetaNodeName, CacheItemNodeName, {

    make : function() {
        var meta = U.extend({}, this.item, {
            cachekey : this.cachekey,
            bemDeps  : this.bemDeps
        });

        return QFS.write(this.getPath(), '(' + JSON.stringify(meta, null, 2) + ')');
    }

}, {

    createId : function(o) {
        return this.createNodePrefix(o.item);
    },

    createNodePath : function() {
        return this.__base.apply(this, arguments) + '-meta.js';
    }

});