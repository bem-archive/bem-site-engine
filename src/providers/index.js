'use strict';

var file = require('./file'),
    disk = require('./disk');

module.exports = {

    /**
     * Initialize github API and yandex disk API
     */
    init: function() {
        disk.init();
        return this;
    },

    getFileProvider: function() {
        return file;
    },

    getYaDiskProvider: function() {
        return disk;
    }
};
