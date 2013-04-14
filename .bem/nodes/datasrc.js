var BEM = require('bem'),
    registry = require('bem/lib/nodesregistry'),
    environ = require('../environ'),
    QFS = BEM.require('q-fs');

registry.decl('Arch', {

    createCustomNodes : function() {
        return QFS.exists(environ.getLibPath('bem-gen-doc', '.bem/make.js'))
            .then(function() {
                // TODO: "bem-gen-doc" скачен — можем билдить
            });
    }

});

