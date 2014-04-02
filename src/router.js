var Susanin = require('susanin'),
    modules = require('./modules');

module.exports = {

    router: null,

    /**
     * Initialize application routes
     * Iterates through compiled model route objects and creates Susanin routes
     * @returns {exports}
     */
    init: function() {
        var self = this;

        this.router = Susanin();

        modules.model.getRoutes().forEach(function(route) {
            self.router.addRoute(route);
        });

        return this;
    }
};
