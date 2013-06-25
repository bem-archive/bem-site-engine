var PATH = require('path'),
    GLOBAL_ROOT_NAME = '__root_level_dir',
    DECL_SEP = '@';

// XXX: `__root_level_dir` должна быть установлена только один раз
// FIXME: подумать, как обойтись без `env`
process.env[GLOBAL_ROOT_NAME] ||
    (process.env[GLOBAL_ROOT_NAME] = PATH.dirname(__dirname));


var environ = require('../environ'),
    registry = require('bem/lib/nodesregistry');

registry.decl('Arch', {

    /**
     * Defines projects libraries dependencies base on environ's config
     *
     * @param {Array} libs Array of libraries' ids
     * @return {Object}
     */
    useLibraries : function(libs) {

        // список изветсных библиотек блоков
        var repo = environ.getConf().libraries,
            relative = PATH.relative.bind(null, this.root),
            getLibPath = environ.getLibPath;

        return libs.reduce(function(enabled, lib) {

            if(~lib.indexOf(DECL_SEP)) {
                var parts = lib.split(DECL_SEP),
                    treeish;

                lib = parts[0].trim();
                treeish = parts.splice(1).join(DECL_SEP).trim();
            }

            if(repo[lib] == null)
                throw new Error('Library ' + lib + ' is not registered!');

            var decl = repo[lib];
            treeish && (decl.treeish = treeish);

            enabled[relative(getLibPath(lib))] = decl;
            return enabled;

        }, {});

    },

    /**
     * @returns {Object}
     * @override
     */
    getLibraries : function() {

        var libs = this.libraries;
        return Array.isArray(libs)?
                this.useLibraries(libs) : libs;

    },

    /**
     * @returns {Array}
     * @override
     */
    createBlockLibrariesNodes : function() {

        var libs = this.__base.apply(this, null),
            libsNodeName = environ.LIB_DIR;

        if(libsNodeName && libsNodeName !== '.') {
            var node = new (registry.getNodeClass('Node'))(libsNodeName);
            this.arch.setNode(node, null, libs);
        }

        /**
         * XXX: hack!
         * Saving array of lib nodes for future substraction from Block|Bundles nodes
         */
        return this._libraries = libs;

    },

    /**
     * Substracting LibrariesNodes from `nodes` array for prevent linking them with
     * caller nodes
     *
     * @param {Array} nodes
     * @returns {Array}
     */
    substractLibrariesNodes : function(nodes) {

        return this.opts.force? nodes : nodes.filter(function(n) {
            return !~this._libraries.indexOf(n);
        }, this);

    },

    /**
     * @override
     */
    createBlocksLevelsNodes: function(parent, children) {

        return this.__base.call(this, parent,
                this.substractLibrariesNodes.call(this, children));

    },

    /**
     * @override
     */
    createBundlesLevelsNodes: function(parent, children) {

        return this.__base.call(this, parent,
                this.substractLibrariesNodes.call(this, children));

    }

});
