var Level = function(name) {
    return this.init(name);
};

Level.prototype = {

    name: null,
    blocks: null,

    /**
     * Initialize level object
     * @param name - {String} level name
     */
    init: function(name) {
        this.name = name.replace(/\.(sets|blocks)/, '');
        this.blocks = [];
    },

    /**
     * Add block to library search item
     * @param block - {String} name of block
     * @returns {Level}
     */
    addBlock: function(block) {
        this.blocks.push(block);
        return this;
    }
};

module.exports = Level;
