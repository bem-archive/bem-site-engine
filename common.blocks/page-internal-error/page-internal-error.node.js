modules.define(
    'yana-view',
    ['yana-logger'],
    function(provide, logger, View) {

View.decl({ name : 'internal-error' }, {

    render : function() {
        var err = this._error;
        if(err && err.stack) {
            return ''.concat(
                err.message,
                '\n',
                err.stack
            );
        }

        // TODO: render some nice static HTML page
        return this.__base.apply(this, arguments);
    }

});

provide(View);

});
