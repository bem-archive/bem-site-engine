var _ = require('lodash');

/**
 *
 * @param name - {String} name of block
 * @param url - {String} url of block
 * @param lib - {String} name of library
 * @param version - {String} name of library version
 * @param level - {String} name of level
 * @param data - {Object} data object for block
 * @param jsdoc - {Object/String} jsdoc
 * @returns {Block}
 * @constructor
 */
var Block = function(name, url, lib, version, level, data, jsdoc) {
    return this.init(name, url, lib, version, level, data, jsdoc);
};

Block.prototype = {
    name: null,
    link: null,
    library: null,
    version: null,
    level: null,
    mods: [],
    elems: [],
    doc: null,
    jsdoc: null,

    /**
     *
     * @param name - {String} name of block
     * @param url - {String} link to block
     * @param lib - {String} name of library
     * @param version - {String} library version
     * @param level - {String} name of level
     * @param data - {Object} inner data for block
     * @param jsdoc - {Object/String} jsdoc
     * @returns {Block}
     */
    init: function(name, url, lib, version, level, data, jsdoc) {
        this.name = name;
        this.link = url;
        this.lib = lib;
        this.version = version;
        this.level = level;
        this.jsdoc = jsdoc;
        return this.processData(data);
    },

    /**
     * Process data for block and
     * create list of elems, mods and other ...
     * @param data - {Object}
     * @returns {Block}
     */
    processData: function(data) {
        if(!data) {
            this.elems = [];
            this.mods = [];
            this.doc = '';

            return this;
        }

        this.elems = (data.elems && _.isArray(data.elems)) ?
            _.pluck(data.elems, 'name') : [];

        this.mods = (data.mods && _.isArray(data.mods)) ?
            _.pluck(data.mods, 'name') : [];

        if(data.description && _.isArray(data.description)) {
            var doc = (_.pluck(data.description, 'content'))[0];
            this.doc = _.isString(doc) ? doc : '';
            //this.doc = (_.pluck(data.description, 'content'))[0];
        }else {
            this.doc = '';
        }

        return this;
    }
};

module.exports = Block;