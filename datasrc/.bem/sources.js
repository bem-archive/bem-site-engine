var CRYPTO = require('crypto'),
    PATH = require('path'),
    CP = require('child_process'),
    VM = require('vm'),
    BEM = require('bem'),

    Q = BEM.require('q'),

    registry = BEM.require('./nodesregistry'),
    nodes = BEM.require('./nodes/node'),
    libNodes = BEM.require('./nodes/lib'),

    U = BEM.util,
    PRJ_ROOT = PATH.resolve(__dirname, '../../'),

    injector = CP.fork('./deps', [], { cwd : process.cwd(), __root_level_dir : '' });

process.env.__root_level_dir = PRJ_ROOT;
var environ = require('../../.bem/environ');

registry.decl(libNodes.LibraryNodeName, {

    __constructor : function(o) {
        this.__base.apply(this, arguments);
        this.bemDeps = o.bemDeps;
    },

    make : function() {
//        return this.__base.apply(this, arguments)
//            .then(function() {
                if(!this.bemDeps)
                    return;

                return this.getBemDependensies()
                    .then(function(libs) {
//                        console.log(this.ctx.arch.getNode('cache').getLibCacheKey(libs['bem-pr']))
//                        console.log(registry.getNodeClass('CacheItemNode'))
                        // TODO
                    }.bind(this));
//            }.bind(this));
    },

    getBemDependensies : function() {
        var defer = Q.defer();

        injector.send({ root : this.getPath() });
        injector.on('message', function(m) {
            defer.resolve(m);
        });

        return defer.promise;
    }

});


registry.decl('CacheNode', nodes.NodeName, {

    __constructor : function(o) {
        this.__base.apply(this, arguments);

        this.arch = o.arch;
        this.root = o.root;

        this._cache = {};
    },

    make : function() {
        return this.__base.apply(this, arguments)
            .then(function() {
                console.log(this.arch.toString());
            }.bind(this))
            .fin(function() {
                injector.kill();
            });
    },

    pushToCache : function(lib) {
        var cachekey = this.getLibCacheKey(lib);
        if(this._cache[cachekey])
            return this._cache[cachekey];

        var item = this._cache[cachekey] = lib,
            node = new (registry.getNodeClass('CacheItemNode'))({
                    root : this.root,
                    item : lib,
                    cachekey : cachekey
                });

        this.arch.setNode(node, this);
        return item;
    },

    getLibCacheKey : function(credential) {
        var shasum = CRYPTO.createHash('sha1');
        shasum.update(JSON.stringify(credential), 'utf8');
        return shasum.digest('hex');
    }

}, {

    createId : function(o) {
        return o.id;
    }

});


registry.decl('CacheItemNode', nodes.NodeName, {

    __constructor : function(o) {
        this.__base.apply(this, arguments);

        this.root = o.root;
        this.item = o.item;
        this.cachekey = o.cachekey;
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx;
        return function() {
            var arch = ctx.arch,
                libNode = this.createLibNode();

            arch.setNode(libNode, arch.getParents(this));
        }.bind(this);
    },

    createLibNode : function() {
        var target = this.getRelPath(),
            lib = this.item,
            libNodeClass = U.toUpperCaseFirst(lib.type) + libNodes.LibraryNodeName;

        return new (registry.getNodeClass(libNodeClass))(U.extend({}, lib, {
                root   : this.root,
                target : target,
                npmPackages : false,
                bemDeps : true
            }));
    },

    getPath : function() {
        return PATH.join(this.root, this.getRelPath());
    },

    getRelPath : function() {
        return PATH.join('.bem', 'cache', this.cachekey);
    }

}, {

    createId : function(o) {
        return o.item._id;
    }

});


registry.decl('SourcesNode', {

    __constructor : function(o) {
        this.arch = o.arch;
        this.root = o.root;
    },

    alterArch : function() {
        var cacheNode = this.createCacheNode();

        return Q.all(this.getLibraries().map(function(id) {
                var lib = this.getLibCredentials(id),
                    cacheitem = cacheNode.pushToCache(lib);
            }, this))
            .then(function() {
                return this.arch;
            }.bind(this));
    },

    createCacheNode : function() {
        var node = new (registry.getNodeClass('CacheNode'))({
                id : 'cache',
                arch : this.arch,
                root : this.root
            });
        this.arch.setNode(node);
        return node;
    },

    getLibraries : function() {
        return [
            'islands-popups'
            ];
    },

    getLibCredentials : function(lib) {
        var id = PATH.basename(lib),
            credential = environ.getConf().libraries[id];

        if(credential == null) {
            throw new Error('Library "' + id + '" (' + lib + ') is not registered!');
        }

        credential._id = id;

        return credential;
    }

});
