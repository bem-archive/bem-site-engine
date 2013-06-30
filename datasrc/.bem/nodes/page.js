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
        return PATH.join(this.root, this.path + '.json');
    },

    make : function() {
        return this.__base.apply(this, arguments)
            .then(function() {
                var arch = this.ctx.arch,
                    items = arch.getChildren(this)
                        .filter(function(i) {
                            return arch.getNode(i) instanceof exports.PageItemNode;
                        })
                        .map(function(i) {
                            return arch.getNode(i);
                        }),
                    path = this.getPath(),
                    index = [];

                return items.reduce(function(promise, item) {
                    return promise
                        .invoke.call(U, 'readFile', item.getPath())
                        .then(function(json) {
                            return JSON.parse(json);
                        })
                        .then(function(json) {
                            var name = json.name,
                                title;

                            if(json.title) {
                                while(title = json.title.pop()) {
                                    if(title.content) {
                                        title = title.content;
                                        break;
                                    }
                                }
                            } else {
                                title = name;
                            }

                            return index.push({ name : name, title : title });
                        });
                }, Q.when())
                .then(function() {
                    return U.writeFileIfDiffers(path, JSON.stringify(index, null, 2));
                }.bind(this));

            }.bind(this));
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
        var path = this.getPath(),
            data = this.data;
        return QFS.makeTree(PATH.dirname(path))
            .then(function() {
                return U.writeFileIfDiffers(path, JSON.stringify(data, null, 2));
            });
    }

});