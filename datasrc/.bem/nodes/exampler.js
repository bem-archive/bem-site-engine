var CP = require('child_process'),
    PATH = require('path'),
    UTIL = require('util'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    blockNodes = BEM.require('./nodes/block.js'),
    fileNodes = BEM.require('./nodes/file.js'),
    
    PRJ_ROOT = PATH.resolve(__dirname, '../../../');


var ExamplerNodeName = exports.ExamplerNodeName = 'ExamplerNode';
Object.defineProperty(exports, ExamplerNodeName, {
    get : function() { return registry.getNodeClass(ExamplerNodeName) }
});


registry.decl(ExamplerNodeName, nodes.NodeName, {
    
    __constructor : function(o) {
        this.__base(o);
        this.root = o.root;
        
        this.libRoot = o.libRoot;
        this.sources = o.sources;
        this.levels = o.levels;
        
        this.path = this.__self.getNodePath(o);
    },
    
    make : function() {
        // TODO: use bem/lib/logger
        return this.createExamples().fail(console.log);
    },
    
    createExamples : function() {
        var defer = Q.defer(),
            worker = CP.fork(PATH.join(__dirname, 'workers', 'make-examples.js'), null, {
                cwd : this.libRoot,
                env : { __root_level_dir : '' }
            });
    
        worker.once('message', function(m) {
            worker.kill();
    
            if(m.code === 0)
                return defer.resolve(m);
    
            defer.reject(new Error(m.msg));
        });
    
        worker.send({ 
            root : this.root,
            path : this.path,
            srcRoot : this.libRoot,
            sources : this.sources,
            levels  : this.levels,
            targets : [ this.path ]
        });
    
        return defer.promise;
    }
    
}, {
    
    createId : function(o) {
        return this.getNodePath(o);
    },

    getNodePath : function(o) {
        return PATH.join(o.path, 'examples');
    }

});
