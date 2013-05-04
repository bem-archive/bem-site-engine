require('./sources.js');

var PATH = require('path'),
    BEM = require('bem'),

    Q = BEM.require('q'),
    APW = BEM.require('apw'),
    registry = BEM.require('./nodesregistry'),
    LOGGER = BEM.require('./logger'),
    MAKE = BEM.require('./make'),

    arch = new APW.Arch(),
    CacherNode = registry.getNodeClass('CacherNode'),
    SourceNode = registry.getNodeClass('SourceNode'),

    targets = process.argv.slice(2),
    opts = {
        root : PATH.dirname(__dirname),
        arch : arch
    };

if(!targets.length) {
    targets = ['sources'];
}

targets.indexOf('cache') > -1 && (opts.force = true);

LOGGER.setLevel('debug');
LOGGER.time('Build total');

[CacherNode, SourceNode].reduce(function(promise, NodeClass) {
        return promise.then(function() {
            return (new NodeClass(opts)).alterArch();
        });
    }, Q.when())
    .then(function() {
        return new MAKE.APW(arch, MAKE.DEFAULT_WORKERS, opts)
            .findAndProcess(targets);
    })
    .fin(function() {
        LOGGER.timeEnd('Build total');
        LOGGER.info(arch.toString());
    })
    .done();
