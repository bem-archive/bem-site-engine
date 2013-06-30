var BEM = require('bem'),
    APW = BEM.require('apw'),
    MAKE = BEM.require('./make.js'),
    make = require('../../lib/make.js'),
    arch = new APW.Arch(),

    // FIXME: с 10 воркерами (bem-tools, default) сборка падает:
    // "Error: channel closed"
    //DEFAULT_WORKERS = 4;
    DEFAULT_WORKERS = 12;

function appendExamplesNodes(DefaultArch) {
    require('../examples.js');

    return DefaultArch;
}

process.once('message', function(m) {
    var srcRoot = m.srcRoot,
        uid = srcRoot,
        targets = m.targets,
        opts = { root : srcRoot },
        args = {
            root : m.root,
            path : m.path,
            srcRoot : srcRoot,
            srcPaths : m.sources,
            srcBuildLevels : m.levels
        };

    make.createArch(opts)
        .then(appendExamplesNodes)
        .then(function(DefaultArch) {
            return new DefaultArch.Arch(arch, opts);
        })
        .then(function(Arch) {
            var arch = Arch.alterArch();
            return arch
                .invoke.call(Arch, 'createExamplesNodes', args)
                .then(function() {
                    return arch;
                });
        })
        .then(function(arch) {
            return new MAKE.APW(arch, DEFAULT_WORKERS, opts).findAndProcess(targets);
        })
        .then(function() {
            process.send({
                uid : uid,
                code : 0
            });
        })
        .fail(function(err) {
            var msg = err.message + '\n' + err.stack;

            process.send({
                code : 1,
                msg  : msg
            });
        })
        .done();
});

process.on('uncaughtException', function(err) {
    var msg = err.message + '\n' + err.stack;

    process.send({
        code : 1,
        msg  : msg
    });
});