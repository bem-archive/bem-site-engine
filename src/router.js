var Susanin = require('susanin'),
    _modules = require('./modules');

module.exports = {

    router: null,

    init: function() {
        var self = this;

        this.router = Susanin();

        _modules.model.getRoutes().forEach(function(route) {
            self.router.addRoute(route);
        });

        return this;
    }
};
