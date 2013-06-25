/* global MAKE */

var sources = require('./sources.js'),
    CacherNode = MAKE.getNodeClass('CacherNode'),
    SourceNode = MAKE.getNodeClass('SourceNode');

MAKE.decl('Arch', {

    alterArch : function() {
        return this.createCacher()
            .then(function() {
                return this.createSourcer();
            }.bind(this))
            .then(function() {
                return this.arch;
            }.bind(this));
    },

    createCacher : function() {
        return (new CacherNode({ root : this.root, arch : this.arch })).alterArch();
    },

    createSourcer : function() {
        return (new SourceNode({ root : this.root, arch : this.arch })).alterArch();
    }

});
