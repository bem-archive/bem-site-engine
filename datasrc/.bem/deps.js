var PATH = require('path'),
    FS = require('fs'),
    VM = require('vm'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    APW = BEM.require('apw'),
    registry = BEM.require('./nodesregistry');

function createArch(opts) {
    var arch = new APW.Arch(),
        DefaultArch = BEM.require('./default-arch'),
        rootMakefile = PATH.join(opts.root, '.bem', 'make.js');

    return QFS.exists(rootMakefile)
        .then(function(exists) {
            if(exists) return include(rootMakefile);
        })
        .then(function() {
            return new (DefaultArch.Arch)(arch, opts);
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
        BEM.util.extend({}, global, {
            MAKE : registry,
            module : null,
            __filename : path,
            __dirname : PATH.dirname(path),
            require : requireFunc,
            include : getIncludeFunc(resolvePath)
        }),
        path);
}

process.on('message', function(m) {
    if(!m.root)
        return;

    createArch({ root : m.root })
        .then(function(archNode) {
            var libs = archNode.getLibraries();
            process.send(libs);
        })
        .done();
});

//process.exit();
