require('./sources');

var PATH = require('path'),
    BEM = require('bem'),

    APW = BEM.require('apw'),
    registry = BEM.require('./nodesregistry'),
    MAKE = BEM.require('./make'),

    arch = new APW.Arch(),
    SourcesNode = registry.getNodeClass('SourcesNode'),

    opts = {
        root : PATH.dirname(__dirname),
        arch : arch,
        force : true
    };


(new SourcesNode(opts))
    .alterArch()
    .then(function(arch) {
        return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts)
            .findAndProcess(['cache']);
    })
    .done();
