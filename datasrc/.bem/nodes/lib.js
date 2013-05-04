var PATH = require('path'),
    CP = require('child_process'),
    VM = require('vm'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    LOGGER = BEM.require('./logger.js'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    libNodes = BEM.require('./nodes/lib.js'),
    cacherNodes = require('./cacher.js'),
    cacheNodes = require('./cache.js'),

    U = BEM.util;


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
        return Q.when(this.installBemDependencies())
            .then(base);
        /*
        return Q.all([
            this.installBemDependencies(),
            this.installNpmDependencies()
        ]);
        */
    },

    getBemDependensies : function() {
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
        if(!arch.hasNode(cacherNodes.CACHE_NODEID))
            return;

        var CacheNode = arch.getNode(cacherNodes.CACHE_NODEID),
            CacheItemNode = registry.getNodeClass(cacheNodes.CacheItemNodeName);

        return Q.all(Object.keys(deps).map(function(lib) {
            var id = PATH.basename(lib),
                item = deps[lib];

            item._id = id;

            CacheNode.pushToCache(item);

            var cacheiid = CacheItemNode.createId({ item : item });
            if(arch.hasNode(cacheiid)) {
                var cacheItemNode = arch.getNode(cacheiid);

                var depNode = new libNodes.SymlinkLibraryNode({
                        root : this.getPath(),
                        target : lib,
                        relative : PATH.relative(this.getPath(), cacheItemNode.getPath()),
                        npmPackages : false
                    });

                depNode.id = PATH.join(this.id, depNode.id);

                arch
                    .setNode(depNode, arch.getParents(this))
                    .addChildren(depNode, cacheItemNode);
            }
        }, this));
    },

    installBemDependencies : function() {
        if(this.bemDeps == null) {
            LOGGER.finfo('bemDeps config variable is not set, skip installing BEM dependencies for the %s library', this.target);
            return;
        }

        return Q.when(this.getBemDependensies())
            .then(function(libs) {
                if(!libs || Array.isArray(libs))
                    return;
                return this.addBemDependencies(libs);
            }.bind(this));
    }

    /*
    getNpmDependencies : function(pkg) {
        var excludePkgs = ['bem'],
            _t = this;

        return QFS.exists(pkg)
            .then(function(exists) {
                if(!exists) {
                    LOGGER.finfo('%s file does not exist, skip installing npm dependencies for the %s library',
                            pkg, _t.target);
                    return [];
                }

                return U.readFile(pkg)
                    .then(function(json) {
                        json = JSON.parse(json);

                        var npmDeps = json.dependencies,
                            deps = [];

                        if(!npmDeps) {
                            return deps;
                        }

                        return Object.keys(npmDeps).reduce(function(deps, name) {
                            if(excludePkgs.indexOf(name) === -1) {
                                deps.push(name + '@' + npmDeps[name]);
                            }
                            return deps;
                        }, deps);
                    });
            });
    },

    installNpmDependencies : function() {
        if(this.npmPackages === false) {
            LOGGER.finfo('npmPackages config variable is set to false, skip installing npm dependencies for the %s library', this.target);
            return;
        }

        var _t = this;
        return Q.all(this.npmPackages.map(function(pkg) {
            var package = PATH.join(this.getPath(), pkg),
                opts = { cwd: PATH.dirname(package) },
                npm = process.env.NPM || 'npm',
                npmEnv = process.env.NPM_ENV || 'production';

            return this.getNpmDependencies(package)
                .then(function(deps) {
                    if(!deps.length) {
                        LOGGER.finfo('There is no usefull npm dependencies for %s library', _t.target);
                        return;
                    }

                    // simple update process
                    //if(!_t.ctx.force) {
                        LOGGER.finfo('Installing dependencies for %s library (npm install)', _t.target);

                        var cmd = npm + ' install ' + deps.join(' ') + ' --' + npmEnv;
                        _t.log(cmd);

                        return U.exec(cmd, opts);
                    //}

                    LOGGER.finfo('Installing dependencies for %s library (npm prune && npm update)', _t.target);

                    var cmd = npm + ' cache clean';
                    _t.log(cmd);

                    return U.exec(cmd, opts)
                        .then(function() {
                            var cmd = npm + ' prune';
                            _t.log(cmd);
                            return U.exec(cmd, opts);
                        })
                        .then(function() {
                            return Q.all(deps.map(function(dep) {
                                var cmd = npm + ' update ' + dep;
                                _t.log(cmd);
                                return U.exec(cmd, opts);
                            }));
                        })
                        .fail(console.log.bind('!!!!!!!!!!!!!!!!'));
                });
            }, this));
    }
    */

});
