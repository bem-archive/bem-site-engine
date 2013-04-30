require('./sources.js');

var PATH = require('path'),
    BEM = require('bem'),

    APW = BEM.require('apw'),
    registry = BEM.require('./nodesregistry'),
    LOGGER = BEM.require('./logger'),
    MAKE = BEM.require('./make'),

    arch = new APW.Arch(),
    SourcesNode = registry.getNodeClass('SourceNode'),

    opts = {
        root : PATH.dirname(__dirname),
        arch : arch,
        verbosity : 'silly'
    };

LOGGER.time('Build total');
(new SourcesNode(opts))
    .alterArch()
    .then(function(arch) {
        return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts)
            .findAndProcess(['sources']);
    })
    .fin(function() {
        LOGGER.timeEnd('Build total');
        LOGGER.info(arch.toString());
    })
    .done();
