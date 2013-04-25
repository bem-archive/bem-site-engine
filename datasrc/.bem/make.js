require('./sources.js')

var PATH = require('path'),
    BEM = require('bem'),

    APW = BEM.require('apw'),
    registry = BEM.require('./nodesregistry'),
    MAKE = BEM.require('./make'),

    arch = new APW.Arch(),
    SourcesNode = registry.getNodeClass('SourceNode'),

    opts = {
        root : PATH.dirname(__dirname),
        arch : arch,
        verbosity : 'silly'
    };

(new SourcesNode(opts))
    .alterArch()
    .then(function(arch) {
        return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts)
            .findAndProcess(['cache']);
    })
    .fin(function() {
        console.log(arch.toString());
    })
    .done();
