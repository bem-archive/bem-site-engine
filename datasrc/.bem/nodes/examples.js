var CP = require('child_process'),
    PATH = require('path'),
    UTIL = require('util'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    registry = BEM.require('./nodesregistry.js'),
    LOGGER = BEM.require('./logger.js'),
    nodes = BEM.require('./nodes/node.js'),
    blockNodes = BEM.require('./nodes/block.js'),
    fileNodes = BEM.require('./nodes/file.js'),
    
    PRJ_ROOT = PATH.resolve(__dirname, '../../../'),
    environ = require(PATH.join(PRJ_ROOT, '.bem/environ.js')),
    setsNodes = require(environ.getLibPath('bem-pr', 'bem/nodes/sets.js')),
    
    createLevel = BEM.createLevel,
    U = BEM.util;

registry.decl('Arch', {
    
    createExamplesNodes : function(opts) {
        var arch = this.arch,
            node = new (registry.getNodeClass('ExamplesLevelNode'))({
                root : opts.root,
                path : opts.path,
                srcRoot  : opts.srcRoot,
                srcPaths : opts.srcPaths,
                srcBuildLevels : opts.srcBuildLevels
            }),
            rootNode = new nodes.Node('__examples__');
        
        arch.setNode(rootNode).setNode(node, rootNode);
        
        return node;
    }
    
});

/*
registry.decl('ExamplesLevelNode', nodes.NodeName, {
    
    __constructor : function(o) {
        this.root = o.root;         // legoa/
        this.path = o.path;         // _islands-dynamic/examples/
        this.srcRoot = o.srcRoot;   // .bem/cache/089f9d248c75dbc8fbf76f5dcbc6cfd32cb45a4c/
        this.srcPaths = o.srcPaths; // ['common.blocks', 'desktop.blocks']
    }
    
});
*/


registry.decl('DocumentNode', fileNodes.FileNode, {
    
    useOrCreateDocumentNode : function() {
        var arch = this.ctx.arch,
            path = this.path,
            pathNode;

        if(arch.hasNode(path)) {
            pathNode = arch.getNode(path);
        } else {
            pathNode = this.createDocumentNode();
        }
        
        return Q.when(pathNode);
    },
    
    createDocumentNode : function() {
        return this.makeTree()
            .then(function() {
                return new fileNodes.FileNode({ root : this.root, path : this.path });
            }.bind(this));
    },
    
    makeTree : function() {
        return QFS.exists(this.getPath())
            .then(function(exists) {
                if(!exists) return QFS.makeTree(this.getPath());
            }.bind(this));
    },
    
    make : function() {
        return Q.resolve();
    }
    
});


registry.decl('ExamplesLevelNode', 'DocumentNode', {
    
    __constructor : function(o) {
        this.__base(o);
        
        this.root = o.root;
        this.path = o.path;
        this.srcRoot = o.srcRoot;
        this.srcPaths = o.srcPaths;
        this.srcBuildLevels = o.srcBuildLevels;
    },
    
    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },
    
    /** @returns {Function} */
    alterArch : function() {
        var ctx = this.ctx;
        return function() {
            var arch = ctx.arch,
                srcs = this.scanSources();
            
            return this.createExamplesRootNode()
                .then(function(examplesRoot) {
                    arch.addParents(examplesRoot, arch.getParents(this));
                    
                    return srcs.map(function(item) {                        
                        var level = this.createExampleLevelNode(item);
                        arch.addParents(level, examplesRoot);
                    }, this);
                }.bind(this));
        };
    },
    
    createExamplesRootNode : function() {
        var arch = this.ctx.arch;
        return this.useOrCreateDocumentNode()
            .then(function(node) {
                arch.setNode(node);
                return node;
            });
    },
    
    createExampleLevelNode : function(item) {
        var opts = {
                root  : this.root,
                level : this.getPath(),
                srcRoot : this.srcRoot,
                srcBuildLevels : this.srcBuildLevels,
                item : item
            },
            level = new (registry.getNodeClass('ExampleLevelNode'))(opts);
        
        this.ctx.arch.setNode(level);
        
        return level;
    },
    
    getSourceItemTechs : function() {
        return [
            'examples'
        ];
    },

    getSourcesLevels : function() {
        if(!this._srcPaths) {
            var absolutivize = PATH.resolve.bind(null, this.srcRoot);
            this._srcPaths = this.srcPaths.map(function(level) {
                    if(typeof level === 'string')
                        return createLevel(absolutivize(level));
                    return level;
                });
        }

        return this._srcPaths;
    },

    scanSources : function() {
        return this.getSourcesLevels()
            .map(this.scanSourceLevel.bind(this))
            .reduce(function(decls, item) {
                return decls.concat(item);
            }, []);
    },

    scanSourceLevel : function(level) {
        var relativize = PATH.relative.bind(null, this.srcRoot),
            techs = this.getSourceItemTechs();

        return level.getItemsByIntrospection()
            .filter(function(item) {
                if(~techs.indexOf(item.tech)) {
                    item.level = relativize(level.dir);
                    return true;
                }
                return false;
            });
    }
    
}, {
    
    createId : function(o) {
        return o.path + '*';
    }
    
});


registry.decl('ExampleLevelNode', 'DocumentNode', {
   
    __constructor : function(o) {
        this.item = o.item;
        this.srcRoot = o.srcRoot;
        this.srcBuildLevels = o.srcBuildLevels;
        
        this._level = o.level;
        
        this._srcItemLevel = {};
        this._srcBlockLevelNode = {};
        
        Object.defineProperty(this, 'level', {
            get : function() {
                return createLevel(this._level);
            }
        });
        
        return this.__base(U.extend({ path : this.__self.createNodePath(o) }, o));
    },
    
    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },
    
    /** @returns {Function} */
    alterArch : function() {
        var ctx = this.ctx;
        
        return function() {
            var arch = ctx.arch,
                blockSource = this.createBlockSourceNode();
            
            this._srcBlockLevelNode = blockSource;
            
            this._srcItemLevel = createLevel(
                    this._srcBlockLevelNode.level.getPathByObj(this.item, this.item.tech));
            
            return this.createBlockExampleRootNode()
                .then(function(blockExampleRoot) {
                    arch.addParents(blockExampleRoot, arch.getParents(this));

                    var decls = this.scanSourceLevel();
                    decls.forEach(function(item) {
                        // bemjson.js for example
                        var exampleSourceNode = this.createBlockExampleSourceNode(item),
                            // node for building example's bundle
                            exampleBundleNode = this.createBlockExampleBundleNode(item),
                            // original bemjson file from block's example
                            exampleReferenceNode = new fileNodes.FileNode({
                                root : this.srcRoot,
                                path : PATH.relative(this.srcRoot, 
                                        this._srcItemLevel.getPathByObj(item, item.tech))
                            });
                            
                        arch
                            .setNode(exampleReferenceNode)
                            .addParents(exampleBundleNode, blockExampleRoot)
                            .addParents(exampleSourceNode, exampleBundleNode)
                            .addChildren(exampleSourceNode, [this._srcBlockLevelNode, exampleReferenceNode]);
                    }, this);
                    
                }.bind(this));
        };
    },
    
    createBlockExampleRootNode : function() {
        var arch = this.ctx.arch;
        return this.useOrCreateDocumentNode()
            .then(function(node) {
                arch.setNode(node);
                return node;
            });
    },
    
    createBlockSourceNode : function() {
        var arch = this.ctx.arch,
            opts = {
                root  : this.srcRoot,
                item  : this.item,
                level : this.item.level
            };
        
        var node,
            id = blockNodes.BlockNode.createId(opts);

        if(arch.hasNode(id)) {
            node = arch.getNode(id);
        } else {
            node = new blockNodes.BlockNode(opts);
            arch.setNode(node);
        }
        
        return node;
    },
    
    createBlockExampleSourceNode : function(item) {
        var opts = {
                root : this.root,
                level : this.getPath(),
                srcRoot  : this.srcRoot,
                srcLevel : this._srcItemLevel,
                item : item
            },
            source = new (registry.getNodeClass('ExampleSourceNode'))(opts);
        
        this.ctx.arch.setNode(source);
        
        return source;
    },
    
    createBlockExampleBundleNode : function(item) {
        var opts = {
                root  : this.root,
                level : this.getPath(),
                srcRoot  : this.srcRoot,
                srcLevel : this._srcItemLevel,
                buildLevels : this.srcBuildLevels,
                item : item
            },
            bundle = registry.getNodeClass('ExampleBundleNode').create(opts);
        
        this.ctx.arch.setNode(bundle);
        
        return bundle;
    },
    
    /** @override */
    createDocumentNode : function() {
        return this.makePathLevel()
            .fail(function(err) {
                if(err && err.type === 'LEVEL_EXISTS') {
                    return;
                }
                return Q.reject(err);
            })
            .then(function() {
                return new fileNodes.FileNode({ root : this.root, path : this.path });
            }.bind(this));
    },
    
    makePathLevel : function() {
        var path = this.getPath();
        
        return QFS.exists(path)
            .then(function(exists) {
                if(exists && U.isLevel(path)) {
                    return Q.reject({
                        type : 'LEVEL_EXISTS', 
                        message : UTIL.format('"%s" is already exists', this.path)
                    });
                }
            }.bind(this))
            .then(function() {
                var bundlesLevel = PATH.resolve(this.srcRoot, '.bem/levels/bundles.js');
                return QFS.exists(bundlesLevel)
                    .then(function(exists) {
                        if(!exists) return '';
                        return bundlesLevel;
                    });
            }.bind(this))
            .then(function(level) {
                var p = { cmd : 'level' };
                
                p.opts = {
                    outputDir : PATH.dirname(path),
                    level : level,
                    force : true    // FIXME: hardcode
                };
                p.args = {
                    names : [ PATH.basename(path) ]
                };
                
                return p;
            })
            .then(function(p) {
                var d = Q.defer(),
                    worker = CP.fork(
                            BEM.require.resolve('./nodes/workers/bemcreate.js'), 
                            null, 
                            { env: process.env }),
                    handler = function(m) {
                        (m.code !== 0)? d.reject(m.msg) : d.resolve();
                    };

                worker.on('exit', function(code) {
                    LOGGER.fdebug("Exit of bemcreate worker for node '%s' with code %s", this.output, code);
                    handler({ code: code });
                }.bind(this));

                worker.on('message', function(m) {
                    LOGGER.fdebug("Message from bemcreate worker for node '%s': %j", this.output, m);
                    handler(m);
                }.bind(this));

                worker.send(p);

                return d.promise;
            });
    },
    
    getSourceItemTechs : function() {
        return ['bemjson.js'];
    },

    scanSourceLevel : function() {
        var techs = this.getSourceItemTechs();
        
        return this._srcItemLevel
            .getItemsByIntrospection()
            .filter(function(item) {
                return ~techs.indexOf(item.tech);
            });
    }
    
}, {
    
    createId : function(o) {
        return this.createNodePath(o) + '*';
    },
    
    createNodePath : function(o) {
        var level = o.level,
            item = o.item;
        // TODO: `level` should be "simple"
        return PATH.relative(o.root, createLevel(level).getPathByObj(item, item.tech));
    }
    
});


registry.decl('ExampleSourceNode', fileNodes.GeneratedFileNodeName, {
    
    __constructor : function(o) {
        this.item = o.item;
        this.srcRoot = o.srcRoot;
        this.srcLevel = o.srcLevel;
        
        this._level = o.level;
        
        Object.defineProperty(this, 'level', {
            get : function() {
                return createLevel(this._level);
            }
        });
        
        return this.__base(U.extend({ path : this.__self.createNodePath(o) }, o));
    },
    
    make : function() {
        var source = this.srcLevel.getPathByObj(this.item, this.item.tech),
            dest = this.getPath();
        
        return QFS.exists(PATH.dirname(dest))
            .then(function(exists) {
                if(!exists) return QFS.makeTree(PATH.dirname(dest));
            })
            .then(function() {
                return U.readFile(source);
            })
            .then(function(data) {
                return U.writeFileIfDiffers(dest, data);
            });
    }
    
}, {
    
    createId : function(o) {
        return this.createNodePath(o);
    },
    
    createNodePath : function(o) {
        var level = o.level,
            item = o.item;
        return PATH.relative(o.root, createLevel(level).getPathByObj(item, item.tech));
    }
    
});


registry.decl('ExampleBundleNode', setsNodes.ExampleNodeName, {
   
    __constructor : function(o) {
        this.__base(o);

        this.srcRoot = o.srcRoot;
        this.srcLevel = o.srcLevel;
        this.buildLevels = o.buildLevels;
        
        this._level = o.level;
        
        Object.defineProperty(this, 'level', {
            get : function() {
                return createLevel(this._level);
            }
        });
    },
    
//    getTechs : function() {
//        // FIXME: hardcode
//        return ['bemjson.js', 'bemdecl.js', 'deps.js', 'css', 'js'];
//    },
    
    getSourceNodePrefix : function() {
        if(!this._sourceNodePrefix) {
            this._sourceNodePrefix = this.__self.createNodePrefix({
                root  : this.srcRoot,
                level : this.srcLevel,
                item  : this.item
            });
        }
        
        return this._sourceNodePrefix;
    },
    
    getLevels : function(tech) {
        var resolve = PATH.resolve.bind(null, this.srcRoot);
            
        return this.buildLevels
            .concat([this.srcLevel.getTech('blocks').getPath(this.getSourceNodePrefix())])
            .map(function(level) {
                return resolve(level);
            });
    }
    
});
