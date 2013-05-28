var BEM = require('bem'),
    APW = BEM.require('apw'),
    make = require('../../lib/make.js'),
    arch = new APW.Arch();

process.once('message', function(m) {
    var root = m.root,
        opts = { root : root };

    make.createArch(opts)
        .then(function(Arch) {
            return new (Arch.Arch)(arch, opts);
        })
        .then(function(archNode) {
            var libraries = archNode.getLibraries();
            process.send({
                code : 0,
                deps : libraries
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
