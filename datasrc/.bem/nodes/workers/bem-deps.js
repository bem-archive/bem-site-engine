var PATH = require('path'),
    MAKE = require('../../lib/make.js'),
    APW = MAKE.BEM.require('apw'),
    arch = new APW.Arch();

process.once('message', function(m) {
    var root = m.root,
        opts = { root : root };
    
    process.env.__root_level_dir = '';

    MAKE.createArch(opts)
        .then(function(Arch) {
            return new (Arch.Arch)(arch, opts);
        })
        .then(function(archNode) {
            var libraries = archNode.getLibraries();
            process.send({ 
                root : root, 
                code : 0, 
                deps : libraries 
            });
        })
        .fail(function(err) {
            process.send({
                root : root,
                code : 1,
                msg : err.stack || err
            });
        })
        .done();
});
