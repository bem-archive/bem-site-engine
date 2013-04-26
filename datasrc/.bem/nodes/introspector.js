var PATH = require('path'),
    BEM = require('BEM'),
    Q = BEM.require('qq'),
    QFS = BEM.require('q-fs'),
    registry = BEM.require('./nodesregistry.js'),
    nodes = BEM.require('./nodes/node.js'),
    fileNodes = BEM.require('./nodes/file.js'),

    createLevel = BEM.createLevel,
    U = BEM.util;


var IntrospectorNodeName = exports.IntrospectorNodeName = 'IntrospectorNode';
Object.defineProperty(exports, IntrospectorNodeName, {
    get : function() { return registry.getNodeClass(IntrospectorNodeName) }
});

registry.decl(IntrospectorNodeName, nodes.NodeName, {

    __constructor : function(o) {
        this.__base(o);
        this.root = o.root;
        this.sources = o.sources;
    },

    make : function() {
        return this.getStruct().then(console.log);
    },

    getStruct : function() {
        var root = this.root;
        return Q.reduceLeft(this.sources, function(decls, level) {
            var levelPath = PATH.resolve(root, level);

            createLevel(levelPath).getDeclByIntrospection().forEach(function(decl) {
                var name = decl.name;

                decl.level = { path : level };
                (decls[name] || (decls[name] = [])).push(decl);
            });

            return decls;
        }, {});
    }

}, {

    createId : function(o) {
        return o.id;
    }

});


var IntrospectorItemNodeName = exports.IntrospectorItemNodeName = 'IntrospectorItemNode';
Object.defineProperty(exports, IntrospectorItemNodeName, {
    get : function() { return registry.getNodeClass(IntrospectorItemNodeName) }
});

registry.decl(IntrospectorItemNodeName, fileNodes.GeneratedFileNodeName, {

    __constructor : function(o) {
        this.__base(o);
        this.decl = o.decl;
        this.path = PATH.join('.bem', 'cache', this.path + '-introspect.js');
    },

    make : function() {
        return this.writeDecl();
    },

    readDecl : function() {
        return U.readFile(this.getPath())
            .then(function(decl) {
                return JSON.parse(decl);
            });
    },

    writeDecl : function() {
        var path = this.getPath();
        return QFS.makeTree(PATH.dirname(path))
            .then(function() {
                return U.writeFileIfDiffers(path, JSON.stringify(this.decl, null, 2));
            }.bind(this));
    }

}, {

    createId : function(o) {
        return o.path + '/introspect';
    }

});
