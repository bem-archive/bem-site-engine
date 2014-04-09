var BaseProvider = function() {

};

BaseProvider.prototype = {

    init: function() {
        logger.warn('Init action is not defined');
    },

    load: function(options) {
        logger.warn('Load action is not defined');
    },

    save: function(options) {
        logger.warn('Save action is not defined');
    },

    copy: function(options) {
        logger.warn('Copy action is not defined');
    },

    move: function(options) {
        logger.warn('Move action is not defined');
    },

    makeDir: function(options) {
        logger.warn('Make directory action is not defined');
    }
};

exports.BaseProvider = BaseProvider;