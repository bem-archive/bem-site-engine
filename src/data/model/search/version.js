var _ = require('lodash');

var Version = function (name, link, doc, current) {
    return this.init(name, link, doc, current);
};

Version.prototype = {

    name: null,
    current: false,
    doc: null,
    link: null,
    levels: [],

    /**
     * Initialize library version search object
     * @param name - {String} name of library version
     * @param link - {String} readme string representation
     * @param readme - {String} url
     * @param current - {Boolean} indicates that this library version is current
     * @returns {Version}
     */
    init: function (name, link, readme, current) {
        this.name = name;
        this.link = link;
        this.doc = readme;
        this.current = current;
        this.levels = [];
        return this;
    },

    /**
     * Add level to library search item
     * @param level - {Level} level object
     * @returns {Version}
     */
    addLevel: function (level) {
        this.levels.push(level);
        return this;
    },

    /**
     * Returns level object by it name
     * @param name - {String} name of level
     * @returns {Level}
     */
    getLevel: function (name) {
        return _.find(this.levels, function (item) {
            return item.name && name.indexOf(item.name) > -1;
        });
    }
};

module.exports = Version;
