modules.define(
    'yana-view',
    ['yana-logger'],
    function(provide, logger, View) {

View.decl({ name : 'not-found', base : 'le-page' }, {

    __constructor : function(req, res, path, params) {
        // FIXME: ugly!
        req.route.data.name = 'error';

        return this.__base.call(this, req, res, path, params);
    }

});

provide(View);

});
