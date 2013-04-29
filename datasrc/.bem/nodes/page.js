var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('q'),
    QFS = BEM.require('q-fs'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    fileNodes = BEM.require('./nodes/file.js'),

    U = BEM.util;


var PageNodeName = exports.PageNodeName = 'PageNode';
Object.defineProperty(exports, PageNodeName, {
    get : function() { return registry.getNodeClass(PageNodeName) }
});

registry.decl(PageNodeName, nodes.NodeName, {

    __constructor : function(o) {
        this.__base(o);
        this.root = o.root;
        this.path = this.__self.getNodePath(o);
    },

    getPath : function() {
        return PATH.join(this.root, this.path);
    },

    make : function() {
        return QFS.makeTree(this.getPath());
    }

}, {

    createId : function(o) {
        return this.getNodePath(o);
    },

    getNodePath : function(o) {
        return PATH.join(o.path, 'blocks');
    }

});


var PageItemNodeName = exports.PageItemNodeName = 'PageItemNode';
Object.defineProperty(exports, PageItemNodeName, {
    get : function() { return registry.getNodeClass(PageItemNodeName) }
});

registry.decl(PageItemNodeName, fileNodes.GeneratedFileNodeName, {

    __constructor : function(o) {
        this.__base(o);
        this.data = o.data;
        this.path = o.path;
    },

    getPath : function() {
        return PATH.join(this.root, this.path + '.json');
    },

    make : function() {
        return U.writeFileIfDiffers(this.getPath(), JSON.stringify(this.data, null, 2));
    }

});
