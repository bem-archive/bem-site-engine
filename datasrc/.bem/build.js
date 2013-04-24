var CP = require('child_process'),
    CRYPTO = require('crypto'),
    FS = require('fs'),
    PATH = require('path'),
    VM = require('vm'),
    BEM = require('bem'),

    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    APW = BEM.require('apw'),
    MAKE = BEM.require('./make'),
    REGISTRY = BEM.require('./nodesregistry'),

    nodes = BEM.require('./nodes/node'),
    libNodes = BEM.require('./nodes/lib'),

    U = BEM.util,

    datasrcRoot = PATH.dirname(__dirname),
    opts = {
        root : PATH.join(datasrcRoot, '.bem/cache/fa9c837815fd65a33943168b1d0f01d15d02592d')
    };

function createArch(opts) {
    var arch = new APW.Arch(),
        DefaultArch = BEM.require('./default-arch'),
        rootMakefile = PATH.join(opts.root, '.bem', 'make.js');

    return QFS.exists(rootMakefile)
        .then(function(exists) {
            if(exists) return include(rootMakefile);
        })
        .then(function() {
            return new (DefaultArch.Arch)(arch, opts); //.alterArch();
        });
}

function getPathResolver(base) {
    return function(path) {
        return path.match(/^\./)? PATH.resolve(PATH.dirname(base), path) : path;
    };
}

function getRequireFunc(resolvePath) {
    return function(path) {
        return require(resolvePath(path));
    };
}

function getIncludeFunc(resolvePath) {
    return function(path) {
        return include(resolvePath(path));
    };
}

function include(path) {
    return evalConfig(FS.readFileSync(path, 'utf8'), path);
}

function evalConfig(content, path) {
    var resolvePath = getPathResolver(path),
        requireFunc = getRequireFunc(resolvePath);

    // let require.resolve() to work in make.js modules
    requireFunc.resolve = resolvePath;

    VM.runInNewContext(
        content,
        U.extend({}, global, {
            MAKE: require(opts.root + '/node_modules/bem/lib/nodesregistry'),
            module: null,
            __filename: path,
            __dirname: PATH.dirname(path),
            require: requireFunc,
            include: getIncludeFunc(resolvePath)
        }),
        path);
}

function cacheKey(lib) {
//    return lib;
    var shasum = CRYPTO.createHash('sha1');
    shasum.update(JSON.stringify(lib), 'utf8');
    return shasum.digest('hex');
}


var cache = {};

createArch(opts)
    .then(function(archNode) {
        var arch = archNode.arch,
            libs = archNode.getLibraries();
        console.log(libs)

        archNode.libraries = Object.keys(libs).reduce(function(list, id) {
            var name = PATH.basename(id),
                credential = libs[id],
                ck = cacheKey(name),
                pathCk = PATH.relative(__dirname, PATH.join('cache', ck));

                if(!cache[pathCk]) {
                    credential.originalId = id;
                    cache[pathCk] = credential;
                }

            list[id] = {
                type : 'symlink',
                relative : PATH.relative(archNode.root, pathCk),
                npmPackages : false
            };

            return list;
        }, {});

//        var cacheNode = new nodes.Node('cache');
//        arch.setNode(cacheNode);
//
//        Object.keys(cache).forEach(function(l) {
//            var lib = cache[l],
//                libNodeClass = U.toUpperCaseFirst(lib.type) + libNodes.LibraryNodeName,
//                libNode = new (REGISTRY.getNodeClass(libNodeClass))(U.extend({}, lib, {
//                        root   : __dirname,
//                        target : l
//                    }));
//
//            arch.setNode(libNode, cacheNode);
//        }, archNode);
//
//        console.log(arch.toString())


/*

        return Q.all(archNode.createBlockLibrariesNodes(cacheNode))
            .then(function(libs) {
                Object.keys(cache).forEach(function(l) {
                    var lib = cache[l],
                        libNodeClass = U.toUpperCaseFirst(lib.type) + libNodes.LibraryNodeName,
                        libNode = new (REGISTRY.getNodeClass(libNodeClass))(U.extend({}, lib, {
                                root   : __dirname,
                                target : l
                            }));

                    arch.setNode(libNode, lib.originalId);
                }, archNode);

                // XXX: восстанавливаем значение `__root_level_dir` на уровен проекта
                process.env.__root_level_dir = PATH.resolve(__dirname, '../../.bem');

                var environ = require('../../.bem/environ'),
                    introspectNodes = require(environ.getLibPath('bem-gen-doc', '.bem/nodes/introspect.js')),
                    outputNodes = require(environ.getLibPath('bem-gen-doc', '.bem/nodes/output.js'));

                var introspectNode = new introspectNodes.IntrospectNode({
                        root : opts.root,
                        paths : ['common.blocks'],
                        langs : ['ru']
                    }),
                    itemNode = new outputNodes.CatalogueItemNode({
                        root : opts.root,
                        level : PATH.join(opts.root, 'release'),
                        item : { block : 'islands-popups' },
                        techName : 'data.json'
                    });

                var blockPath = PATH.join(datasrcRoot, '_islands-popups', 'blocks');

                return QFS.makeTree(blockPath)
                    .then(function() {
                        return itemNode.getMeta();
                    })
                    .then(function(meta) {

                        return Q.all(Object.keys(meta).map(function(block) {
                            return this.translateMeta(meta[block])
                                .then(function(data) {
                                    return U.writeFileIfDiffers(
                                            PATH.join(blockPath, [block, 'json.js'].join('.')),
                                            JSON.stringify(data, null, 2));
                                });
                        }, this));

                    }.bind(itemNode))
                    .then(function() {
                        return arch;
                    });

                arch.setNode(introspectNode, null, cacheNode);
//                arch.setNode(itemNode, null, introspectNode);

//                var node = siteNode.createCommonSiteNode();
//                arch.addParents(node, cacheNode);
//                siteNode.createSiteBundlesNode(node);

                console.log(arch.toString())
                return arch;
            });

        return archNode.alterArch()
            .then(function() {


            });
        */
    })
//    .then(function(arch) {
//        return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts)
//            .findAndProcess(['machine-introspect*']);
//    })
    .done();
