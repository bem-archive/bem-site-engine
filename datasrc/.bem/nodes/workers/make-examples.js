var PATH = require('path'),
    make = require('../../lib/make.js'),
    APW = make.BEM.require('apw'),
    MAKE = make.BEM.require('./make.js'),
    arch = new APW.Arch();

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
    
    process.env.__root_level_dir = '';

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
            return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts).findAndProcess(targets);
        })
        .then(function() {
            process.send({
                uid : uid,
                code : 0
            });
        })
        .fail(function(err) {
            process.send({
                root : uid,
                code : 1,
                msg  : err.stack || err
            });
        })
        .done();
});
