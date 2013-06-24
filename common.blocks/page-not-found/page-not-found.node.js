modules.define(
    'yana-view',
    ['yana-logger'],
    function(provide, logger, View) {

provide(View.decl({ name : 'not-found', base : 'page' }, {

    __constructor : function(req, res, path, params) {
        // FIXME: ugly!
        req.route.data.name = 'error';

        return this.__base.call(this, req, res, path, params);
    }

}));

});
